
class ConceptMapInteraction {
    constructor(core, renderer) {
        // Referencias principales
        this.core = core;
        this.renderer = renderer;
        
        // Estados de interacción
        this.selectedNode = null;
        this.hoveredNode = null;
        this.selectedPoint = null;
        this.hoveredPoint = null;
        this.selectedConnection = null;
        this.isDrawingLine = false;
        this.tempLine = null;
        this.isDragging = false;
        this.lastPos = null;
        
        // Estado de edición
        this.editingNode = null;
        this.editingInput = null;

        // Configuración
        this.magnetThreshold = 10;
        this.connectionPointRadius = 5;
        this.connectionThreshold = 20;
        
        // Inicializar eventos
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Mouse events
        this.core.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.core.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.core.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.core.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        this.core.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Prevent context menu
        this.core.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    // Event Handlers
    handleMouseMove(e) {
        const pos = this.getMousePos(e);
        
        // Actualizar estados de hover
        this.hoveredPoint = null;
        this.hoveredNode = this.findNodeAtPosition(pos);
        
        if (this.selectedNode) {
            this.hoveredPoint = this.findConnectionPoint(this.selectedNode, pos);
        }
        
        if (this.isDragging) {
            this.handleDrag(pos);
        }
        
        // Actualizar cursor
        this.core.canvas.style.cursor = this.hoveredPoint ? 'pointer' : 
                                      this.hoveredNode ? 'move' : 
                                      'default';
        
        this.renderer.render();
    }

    handleMouseDown(e) {
        if (e.button !== 0) return; // Solo click izquierdo
        
        const pos = this.getMousePos(e);
        this.isDragging = true;
        this.lastPos = pos;
        
        // Verificar punto de conexión primero
        if (this.selectedNode) {
            const clickedPoint = this.findConnectionPoint(this.selectedNode, pos);
            if (clickedPoint) {
                this.selectedPoint = clickedPoint;
                this.isDrawingLine = true;
                this.tempLine = {
                    startNode: this.selectedNode,
                    startPoint: clickedPoint,
                    endPos: pos
                };
                return;
            }
        }

        // Verificar conexión existente
        const clickedConn = this.findConnectionAtPosition(pos);
        if (clickedConn) {
            this.selectedConnection = clickedConn;
            this.selectedNode = null;
            return;
        }
        
        // Verificar nodo
        const clickedNode = this.findNodeAtPosition(pos);
        if (clickedNode) {
            this.selectedNode = clickedNode;
            return;
        }
        
        // Click en espacio vacío
        this.selectedNode = null;
        this.selectedConnection = null;
    }

    handleMouseUp(e) {
        if (this.isDrawingLine && this.tempLine) {
            const pos = this.getMousePos(e);
            const endNode = this.findNodeAtPosition(pos);
            if (endNode && endNode !== this.tempLine.startNode) {
                const endPoint = this.findConnectionPoint(endNode, pos) || 
                               this.findClosestPoint(endNode, pos);
                this.core.addConnection(
                    this.tempLine.startNode.id,
                    endNode.id,
                    {
                        startPoint: this.tempLine.startPoint,
                        endPoint: endPoint
                    }
                );
            }
        }
        
        this.isDragging = false;
        this.isDrawingLine = false;
        this.tempLine = null;
        this.renderer.render();
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = this.core.scale * delta;
        
        if (newScale >= 0.1 && newScale <= 2) {
            const rect = this.core.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const startX = (mouseX - this.core.offset.x) / this.core.scale;
            const startY = (mouseY - this.core.offset.y) / this.core.scale;
            
            this.core.scale = newScale;
            
            const endX = (mouseX - this.core.offset.x) / this.core.scale;
            const endY = (mouseY - this.core.offset.y) / this.core.scale;
            
            this.core.offset.x += (endX - startX) * this.core.scale;
            this.core.offset.y += (endY - startY) * this.core.scale;
            
            this.constrainOffset();
            this.renderer.render();
        }
    }

    handleDrag(currentPos) {
        if (!this.lastPos) {
            this.lastPos = currentPos;
            return;
        }

        const dx = currentPos.x - this.lastPos.x;
        const dy = currentPos.y - this.lastPos.y;

        if (this.isDrawingLine) {
            this.tempLine.endPos = currentPos;
        } else if (this.selectedNode) {
            const newX = this.selectedNode.x + dx / this.core.scale;
            const newY = this.selectedNode.y + dy / this.core.scale;
            
            // Limitar al espacio de trabajo
            const minX = this.selectedNode.width/2;
            const maxX = this.core.workspaceWidth - this.selectedNode.width/2;
            const minY = this.selectedNode.height/2;
            const maxY = this.core.workspaceHeight - this.selectedNode.height/2;
            
            this.selectedNode.x = Math.max(minX, Math.min(maxX, newX));
            this.selectedNode.y = Math.max(minY, Math.min(maxY, newY));
            
            this.updateNodeConnections(this.selectedNode);
        } else if (this.selectedConnection) {
            this.handleConnectionDrag(currentPos);
        } else {
            // Pan
            const newOffsetX = this.core.offset.x + dx;
            const newOffsetY = this.core.offset.y + dy;
            
            this.core.offset.x = Math.min(0, Math.max(-(this.core.workspaceWidth * this.core.scale - this.core.canvas.width), newOffsetX));
            this.core.offset.y = Math.min(0, Math.max(-(this.core.workspaceHeight * this.core.scale - this.core.canvas.height), newOffsetY));
        }

        this.lastPos = currentPos;
        this.renderer.render();
    }

    handleConnectionDrag(currentPos) {
        const nearestPoint = this.findNearestConnectionPoint(currentPos);
        if (nearestPoint) {
            const startDist = this.getDistanceToPoint(currentPos, this.selectedConnection.startPoint);
            const endDist = this.getDistanceToPoint(currentPos, this.selectedConnection.endPoint);
            
            if (startDist < endDist && nearestPoint.node !== this.selectedConnection.endNode) {
                this.selectedConnection.startNode = nearestPoint.node.id;
                this.selectedConnection.startPoint = nearestPoint.point;
            } else if (nearestPoint.node !== this.selectedConnection.startNode) {
                this.selectedConnection.endNode = nearestPoint.node.id;
                this.selectedConnection.endPoint = nearestPoint.point;
            }
        }
    }

    handleDoubleClick(e) {
        const pos = this.getMousePos(e);
        const node = this.findNodeAtPosition(pos);
        if (node) {
            this.startEditing(node);
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            if (this.editingNode) {
                this.stopEditing();
            } else {
                this.selectedNode = null;
                this.selectedConnection = null;
                this.renderer.render();
            }
        } else if (e.key === 'Enter' && this.editingNode) {
            this.commitEdit();
        } else if ((e.key === 'Delete' || e.key === 'Backspace') && !this.editingNode) {
            if (this.selectedNode) {
                this.core.deleteNode(this.selectedNode.id);
                this.selectedNode = null;
            } else if (this.selectedConnection) {
                this.core.deleteConnection(this.selectedConnection.id);
                this.selectedConnection = null;
            }
            this.renderer.render();
        }
    }

    // Node Editing Methods
    startEditing(node) {
        const canvasRect = this.core.canvas.getBoundingClientRect();
        const input = document.createElement('input');
        input.type = 'text';
        input.value = node.text;
        input.style.position = 'absolute';
        input.style.left = `${canvasRect.left + (node.x * this.core.scale + this.core.offset.x) - node.width/2}px`;
        input.style.top = `${canvasRect.top + (node.y * this.core.scale + this.core.offset.y) - 10}px`;
        input.style.width = `${node.width * this.core.scale}px`;
        input.style.zIndex = '1000';
        input.style.padding = '4px';
        input.style.fontSize = `${node.style.fontSize * this.core.scale}px`;
        input.style.textAlign = 'center';
        
        this.editingNode = node;
        this.editingInput = input;
        
        document.body.appendChild(input);
        input.focus();
        input.select();
        
        input.addEventListener('blur', () => this.commitEdit());
    }

    commitEdit() {
        if (this.editingNode && this.editingInput) {
            this.editingNode.text = this.editingInput.value;
            this.editingInput.remove();
            this.editingInput = null;
            this.editingNode = null;
            this.renderer.render();
        }
    }

    stopEditing() {
        if (this.editingInput) {
            this.editingInput.remove();
            this.editingInput = null;
            this.editingNode = null;
            this.renderer.render();
        }
    }

    // Connection Methods
    updateNodeConnections(node) {
        this.core.connections.forEach(conn => {
            if (conn.startNode === node.id) {
                const points = this.getConnectionPoints(node);
                conn.startPoint = points.find(p => p.type === conn.startPoint.type);
            }
            if (conn.endNode === node.id) {
                const points = this.getConnectionPoints(node);
                conn.endPoint = points.find(p => p.type === conn.endPoint.type);
            }
        });
    }

    getConnectionPoints(node) {
        return [
            { x: node.x, y: node.y - node.height/2, type: 'top' },
            { x: node.x + node.width/2, y: node.y, type: 'right' },
            { x: node.x, y: node.y + node.height/2, type: 'bottom' },
            { x: node.x - node.width/2, y: node.y, type: 'left' }
        ];
    }

    // Utility Methods
    getMousePos(e) {
        const rect = this.core.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    findNodeAtPosition(pos) {
        const scaledPos = this.getScaledPos(pos);
        return this.core.nodes.find(node => 
            scaledPos.x >= node.x - node.width/2 &&
            scaledPos.x <= node.x + node.width/2 &&
            scaledPos.y >= node.y - node.height/2 &&
            scaledPos.y <= node.y + node.height/2
        );
    }

    getScaledPos(pos) {
        return {
            x: (pos.x - this.core.offset.x) / this.core.scale,
            y: (pos.y - this.core.offset.y) / this.core.scale
        };
    }

    findConnectionPoint(node, pos) {
        const points = this.getConnectionPoints(node);
        const scaledPos = this.getScaledPos(pos);
        
        for (const point of points) {
            const dist = this.getDistance(scaledPos, point);
            if (dist < this.magnetThreshold / this.core.scale) {
                return point;
            }
        }
        return null;
    }

    findClosestPoint(node, pos) {
        const points = this.getConnectionPoints(node);
        const scaledPos = this.getScaledPos(pos);
        
        return points.reduce((closest, point) => {
            const dist = this.getDistance(scaledPos, point);
            if (!closest || dist < closest.dist) {
                return { point, dist };
            }
            return closest;
        }, null).point;
    }

    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    constrainOffset() {
        const maxOffsetX = this.core.workspaceWidth * this.core.scale - this.core.canvas.width;
        const maxOffsetY = this.core.workspaceHeight * this.core.scale - this.core.canvas.height;
        
        this.core.offset.x = Math.min(0, Math.max(-maxOffsetX, this.core.offset.x));
        this.core.offset.y = Math.min(0, Math.max(-maxOffsetY, this.core.offset.y));
    }

    findNearestConnectionPoint(pos) {
        const scaledPos = this.getScaledPos(pos);
        let nearest = null;
        let minDist = Infinity;

        this.core.nodes.forEach(node => {
            const points = this.getConnectionPoints(node);
            points.forEach(point => {
                const dist = this.getDistance(scaledPos, point);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = { node, point };
                }
            });
        });
        
        return minDist < this.connectionThreshold / this.core.scale ? nearest : null;
    }

    findConnectionAtPosition(pos) {
        const scaledPos = this.getScaledPos(pos);
        const threshold = 5 / this.core.scale;
        
        return this.core.connections.find(conn => {
            const start = conn.startPoint;
            const end = conn.endPoint;
            
            // Calcular distancia del punto a la línea
            const d = Math.abs(
                (end.y - start.y) * scaledPos.x -
                (end.x - start.x) * scaledPos.y +
                end.x * start.y -
                end.y * start.x
            ) / Math.sqrt(
                Math.pow(end.y - start.y, 2) +
                Math.pow(end.x - start.x, 2)
            );
            
            return d < threshold;
        });
    }

    getDistanceToPoint(pos, point) {
        const scaledPos = this.getScaledPos(pos);
        return this.getDistance(scaledPos, point);
    }

    findClosestPointOnLine(point, lineStart, lineEnd) {
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return lineStart;

        const t = (
            (point.x - lineStart.x) * dx +
            (point.y - lineStart.y) * dy
        ) / (length * length);

        if (t < 0) return lineStart;
        if (t > 1) return lineEnd;

        return {
            x: lineStart.x + t * dx,
            y: lineStart.y + t * dy
        };
    }

    // Métodos de ayuda para la interacción
    isPointNearLine(point, lineStart, lineEnd, threshold = 5) {
        const closest = this.findClosestPointOnLine(point, lineStart, lineEnd);
        return this.getDistance(point, closest) < threshold;
    }

    getConnectionAngle(startPoint, endPoint) {
        return Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    }

    snapToGrid(point, gridSize = 20) {
        return {
            x: Math.round(point.x / gridSize) * gridSize,
            y: Math.round(point.y / gridSize) * gridSize
        };
    }

    isPointInWorkspace(point) {
        return point.x >= 0 && 
               point.x <= this.core.workspaceWidth && 
               point.y >= 0 && 
               point.y <= this.core.workspaceHeight;
    }

    getNodesBounds() {
        if (this.core.nodes.length === 0) return null;

        return this.core.nodes.reduce((bounds, node) => {
            const halfWidth = node.width / 2;
            const halfHeight = node.height / 2;
            
            bounds.left = Math.min(bounds.left, node.x - halfWidth);
            bounds.right = Math.max(bounds.right, node.x + halfWidth);
            bounds.top = Math.min(bounds.top, node.y - halfHeight);
            bounds.bottom = Math.max(bounds.bottom, node.y + halfHeight);
            
            return bounds;
        }, {
            left: Infinity,
            right: -Infinity,
            top: Infinity,
            bottom: -Infinity
        });
    }

    centerView() {
        const bounds = this.getNodesBounds();
        if (!bounds) return;

        const width = bounds.right - bounds.left;
        const height = bounds.bottom - bounds.top;
        const centerX = bounds.left + width / 2;
        const centerY = bounds.top + height / 2;

        const scale = Math.min(
            this.core.canvas.width / (width * 1.2),
            this.core.canvas.height / (height * 1.2),
            2
        );

        this.core.scale = scale;
        this.core.offset.x = this.core.canvas.width / 2 - centerX * scale;
        this.core.offset.y = this.core.canvas.height / 2 - centerY * scale;
        
        this.constrainOffset();
        this.renderer.render();
    }

    autoLayout() {
        // Implementar distribución automática si se necesita
        this.centerView();
    }

    alignSelectedNodes(alignment) {
        const selectedNodes = this.core.nodes.filter(node => node.isSelected);
        if (selectedNodes.length < 2) return;

        const bounds = selectedNodes.reduce((b, node) => {
            b.left = Math.min(b.left, node.x - node.width/2);
            b.right = Math.max(b.right, node.x + node.width/2);
            b.top = Math.min(b.top, node.y - node.height/2);
            b.bottom = Math.max(b.bottom, node.y + node.height/2);
            return b;
        }, { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });

        switch (alignment) {
            case 'left':
                selectedNodes.forEach(node => {
                    node.x = bounds.left + node.width/2;
                });
                break;
            case 'center':
                const centerX = (bounds.left + bounds.right) / 2;
                selectedNodes.forEach(node => {
                    node.x = centerX;
                });
                break;
            case 'right':
                selectedNodes.forEach(node => {
                    node.x = bounds.right - node.width/2;
                });
                break;
            case 'top':
                selectedNodes.forEach(node => {
                    node.y = bounds.top + node.height/2;
                });
                break;
            case 'middle':
                const centerY = (bounds.top + bounds.bottom) / 2;
                selectedNodes.forEach(node => {
                    node.y = centerY;
                });
                break;
            case 'bottom':
                selectedNodes.forEach(node => {
                    node.y = bounds.bottom - node.height/2;
                });
                break;
        }

        selectedNodes.forEach(node => this.updateNodeConnections(node));
        this.renderer.render();
    }
}