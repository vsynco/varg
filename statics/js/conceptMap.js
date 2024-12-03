class ConceptMap {
  constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      
      // Dimensiones del espacio de trabajo
      this.workspaceWidth = 3000;
      this.workspaceHeight = 2000;
      
      // Estado del mapa
      this.nodes = [];
      this.connections = [];
      this.scale = 1;
      this.offset = { x: 0, y: 0 };
      
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
      
      this.initializeEventListeners();
  }

  initializeEventListeners() {
      // Zoom con límites
      this.canvas.addEventListener('wheel', (e) => {
          e.preventDefault();
          const delta = e.deltaY > 0 ? 0.9 : 1.1;
          const newScale = this.scale * delta;
          if (newScale >= 0.1 && newScale <= 2) {
              const rect = this.canvas.getBoundingClientRect();
              const mouseX = e.clientX - rect.left;
              const mouseY = e.clientY - rect.top;
              
              // Zoom hacia el punto del mouse
              const startX = (mouseX - this.offset.x) / this.scale;
              const startY = (mouseY - this.offset.y) / this.scale;
              
              this.scale = newScale;
              
              const endX = (mouseX - this.offset.x) / this.scale;
              const endY = (mouseY - this.offset.y) / this.scale;
              
              this.offset.x += (endX - startX) * this.scale;
              this.offset.y += (endY - startY) * this.scale;
              
              this.constrainOffset();
              this.render();
          }
      });

      // Manejo de movimiento del mouse
      this.canvas.addEventListener('mousemove', (e) => {
          const pos = this.getMousePos(e);
          
          // Actualizar estado de hover
          this.hoveredPoint = null;
          this.hoveredNode = this.findNodeAtPosition(pos);
          
          if (this.selectedNode) {
              this.hoveredPoint = this.findConnectionPoint(this.selectedNode, pos);
          }
          
          if (this.isDragging) {
              this.handleDrag(pos);
          }
          
          this.canvas.style.cursor = this.hoveredPoint ? 'pointer' : 
                                   this.hoveredNode ? 'move' : 
                                   'default';
          
          this.render();
      });

      // Manejo de click
      this.canvas.addEventListener('mousedown', (e) => {
          if (e.button !== 0) return; // Solo click izquierdo
          
          const pos = this.getMousePos(e);
          this.isDragging = true;
          this.lastPos = pos;
          
          // Prioridad de selección: punto > conexión > nodo
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
          
          const clickedConn = this.findConnectionAtPosition(pos);
          if (clickedConn) {
              this.selectedConnection = clickedConn;
              this.selectedNode = null;
              return;
          }
          
          const clickedNode = this.findNodeAtPosition(pos);
          if (clickedNode) {
              this.selectedNode = clickedNode;
              // No deseleccionar si ya estaba seleccionado
              return;
          }
          
          // Click en espacio vacío
          this.selectedNode = null;
          this.selectedConnection = null;
      });

      // Doble click para editar
      this.canvas.addEventListener('dblclick', (e) => {
          const pos = this.getMousePos(e);
          const node = this.findNodeAtPosition(pos);
          if (node) {
              this.startEditing(node);
          }
      });

      // Finalizar acciones
      this.canvas.addEventListener('mouseup', () => {
          if (this.isDrawingLine && this.tempLine) {
              const endNode = this.findNodeAtPosition(this.lastPos);
              if (endNode && endNode !== this.tempLine.startNode) {
                  const endPoint = this.findConnectionPoint(endNode, this.lastPos) || 
                                 this.findClosestPoint(endNode, this.lastPos);
                  this.connections.push({
                      startNode: this.tempLine.startNode,
                      endNode: endNode,
                      startPoint: this.tempLine.startPoint,
                      endPoint: endPoint
                  });
              }
          }
          
          this.isDragging = false;
          this.isDrawingLine = false;
          this.tempLine = null;
          this.render();
      });

      // Eventos de teclado
      document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
              if (this.editingNode) {
                  this.stopEditing();
              } else {
                  this.selectedNode = null;
                  this.selectedConnection = null;
                  this.render();
              }
          } else if (e.key === 'Enter' && this.editingNode) {
              this.commitEdit();
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
              if (this.selectedConnection) {
                  this.deleteConnection(this.selectedConnection);
                  this.selectedConnection = null;
                  this.render();
              }
          }
      });

      // Prevenir menú contextual
      this.canvas.addEventListener('contextmenu', (e) => {
          e.preventDefault();
      });
  }

  constrainOffset() {
      const maxOffsetX = Math.max(0, this.workspaceWidth * this.scale - this.canvas.width);
      const maxOffsetY = Math.max(0, this.workspaceHeight * this.scale - this.canvas.height);
      
      this.offset.x = Math.min(0, Math.max(-maxOffsetX, this.offset.x));
      this.offset.y = Math.min(0, Math.max(-maxOffsetY, this.offset.y));
  }

  handleDrag(currentPos) {
    if (!this.lastPos) {
        this.lastPos = currentPos;
        return;
    }

    const dx = currentPos.x - this.lastPos.x;
    const dy = currentPos.y - this.lastPos.y;

    if (this.selectedNode) {
        // Mover nodo
        const newX = this.selectedNode.x + dx / this.scale;
        const newY = this.selectedNode.y + dy / this.scale;
        
        // Limitar al espacio de trabajo
        this.selectedNode.x = Math.max(this.selectedNode.width/2, 
            Math.min(this.workspaceWidth - this.selectedNode.width/2, newX));
        this.selectedNode.y = Math.max(this.selectedNode.height/2, 
            Math.min(this.workspaceHeight - this.selectedNode.height/2, newY));
        
        // Actualizar conexiones
        this.updateNodeConnections(this.selectedNode);
    } else if (this.selectedConnection) {
        // Editar conexión
        const nearestPoint = this.findNearestConnectionPoint(currentPos);
        if (nearestPoint && nearestPoint.node !== this.selectedConnection.startNode) {
            this.selectedConnection.endNode = nearestPoint.node;
            this.selectedConnection.endPoint = nearestPoint.point;
        }
    } else if (this.isDrawingLine) {
        this.tempLine.endPos = currentPos;
    } else {
        // Pan con límites
        this.offset.x += dx;
        this.offset.y += dy;
        this.constrainOffset();
    }

    this.lastPos = currentPos;
    this.render();
}

startEditing(node) {
    const canvasRect = this.canvas.getBoundingClientRect();
    const input = document.createElement('input');
    input.type = 'text';
    input.value = node.text;
    input.style.position = 'absolute';
    input.style.left = `${canvasRect.left + (node.x * this.scale + this.offset.x) - node.width/2}px`;
    input.style.top = `${canvasRect.top + (node.y * this.scale + this.offset.y) - 10}px`;
    input.style.width = `${node.width * this.scale}px`;
    input.style.zIndex = '1000';
    
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
        this.render();
    }
}

stopEditing() {
    if (this.editingInput) {
        this.editingInput.remove();
        this.editingInput = null;
        this.editingNode = null;
        this.render();
    }
}

updateNodeConnections(node) {
    this.connections.forEach(conn => {
        if (conn.startNode === node) {
            const points = this.getConnectionPoints(node);
            conn.startPoint = points.find(p => p.type === conn.startPoint.type);
        }
        if (conn.endNode === node) {
            const points = this.getConnectionPoints(node);
            conn.endPoint = points.find(p => p.type === conn.endPoint.type);
        }
    });
}

deleteConnection(connection) {
    const index = this.connections.indexOf(connection);
    if (index > -1) {
        this.connections.splice(index, 1);
    }
}

findConnectionAtPosition(pos) {
    const threshold = 5;
    const scaledPos = {
        x: (pos.x - this.offset.x) / this.scale,
        y: (pos.y - this.offset.y) / this.scale
    };
    
    return this.connections.find(conn => {
        const start = conn.startPoint;
        const end = conn.endPoint;
        
        // Distancia del punto a la línea
        const d = this.pointToLineDistance(scaledPos, start, end);
        return d < threshold;
    });
}

pointToLineDistance(point, lineStart, lineEnd) {
    const numerator = Math.abs(
        (lineEnd.y - lineStart.y) * point.x -
        (lineEnd.x - lineStart.x) * point.y +
        lineEnd.x * lineStart.y -
        lineEnd.y * lineStart.x
    );
    
    const denominator = Math.sqrt(
        Math.pow(lineEnd.y - lineStart.y, 2) +
        Math.pow(lineEnd.x - lineStart.x, 2)
    );
    
    return numerator / denominator;
}

render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    
    // Aplicar transformaciones
    this.ctx.translate(this.offset.x, this.offset.y);
    this.ctx.scale(this.scale, this.scale);
    
    // Dibujar límites del espacio de trabajo
    this.ctx.strokeStyle = '#ddd';
    this.ctx.strokeRect(0, 0, this.workspaceWidth, this.workspaceHeight);
    
    // Dibujar conexiones
    this.renderConnections();
    
    // Dibujar nodos
    this.nodes.forEach(node => this.renderNode(node));
    
    // Dibujar línea temporal
    if (this.tempLine) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.tempLine.startPoint.x, this.tempLine.startPoint.y);
        const endPos = {
            x: (this.tempLine.endPos.x - this.offset.x) / this.scale,
            y: (this.tempLine.endPos.y - this.offset.y) / this.scale
        };
        this.ctx.lineTo(endPos.x, endPos.y);
        this.ctx.strokeStyle = '#0066cc';
        this.ctx.stroke();
    }
    
    this.ctx.restore();
}

renderNode(node) {
    // Dibujar sombra si el nodo está seleccionado
    if (node === this.selectedNode) {
        this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
        this.ctx.shadowBlur = 10;
    }
    
    // Dibujar rectángulo
    this.ctx.fillStyle = node.backgroundColor;
    this.ctx.strokeStyle = node === this.selectedNode ? '#0066cc' : '#000000';
    this.ctx.lineWidth = node === this.selectedNode ? 2 : 1;
    this.ctx.beginPath();
    this.ctx.rect(
        node.x - node.width/2,
        node.y - node.height/2,
        node.width,
        node.height
    );
    this.ctx.fill();
    this.ctx.stroke();
    
    // Resetear sombra
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    
    // Dibujar texto
    this.ctx.fillStyle = node.textColor;
    this.ctx.font = `${node.fontSize}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(node.text, node.x, node.y);
    
    // Dibujar puntos de conexión si el nodo está seleccionado
    if (node === this.selectedNode) {
        this.renderConnectionPoints(node);
    }
}

renderConnectionPoints(node) {
  const points = this.getConnectionPoints(node);
  points.forEach(point => {
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      this.ctx.fillStyle = point === this.hoveredPoint ? '#ff4444' : '#0066cc';
      this.ctx.fill();
      
      // Borde blanco para mejor visibilidad
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
  });
}

renderConnections() {
  this.connections.forEach(conn => {
      this.ctx.beginPath();
      this.ctx.moveTo(conn.startPoint.x, conn.startPoint.y);
      this.ctx.lineTo(conn.endPoint.x, conn.endPoint.y);
      
      // Estilo diferente para conexión seleccionada
      if (conn === this.selectedConnection) {
          this.ctx.strokeStyle = '#0066cc';
          this.ctx.lineWidth = 3;
      } else {
          this.ctx.strokeStyle = '#000000';
          this.ctx.lineWidth = 2;
      }
      
      this.ctx.stroke();
  });
}

// Métodos auxiliares existentes que se mantienen igual
findNodeAtPosition(pos) {
  const scaledPos = {
      x: (pos.x - this.offset.x) / this.scale,
      y: (pos.y - this.offset.y) / this.scale
  };
  
  return this.nodes.find(node => 
      scaledPos.x >= node.x - node.width/2 &&
      scaledPos.x <= node.x + node.width/2 &&
      scaledPos.y >= node.y - node.height/2 &&
      scaledPos.y <= node.y + node.height/2
  );
}

findConnectionPoint(node, pos) {
  const points = this.getConnectionPoints(node);
  const threshold = 10;
  
  for (const point of points) {
      const dx = pos.x - (point.x * this.scale + this.offset.x);
      const dy = pos.y - (point.y * this.scale + this.offset.y);
      if (Math.sqrt(dx * dx + dy * dy) < threshold) {
          return point;
      }
  }
  return null;
}

getConnectionPoints(node) {
  return [
      { x: node.x, y: node.y - node.height/2, type: 'top' },
      { x: node.x + node.width/2, y: node.y, type: 'right' },
      { x: node.x, y: node.y + node.height/2, type: 'bottom' },
      { x: node.x - node.width/2, y: node.y, type: 'left' }
  ];
}

findClosestPoint(node, pos) {
  const points = this.getConnectionPoints(node);
  let minDist = Infinity;
  let closestPoint = null;
  
  for (const point of points) {
      const dx = pos.x - (point.x * this.scale + this.offset.x);
      const dy = pos.y - (point.y * this.scale + this.offset.y);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
          minDist = dist;
          closestPoint = point;
      }
  }
  return closestPoint;
}

findNearestConnectionPoint(pos) {
  let nearest = null;
  let minDist = Infinity;
  
  this.nodes.forEach(node => {
      const points = this.getConnectionPoints(node);
      points.forEach(point => {
          const dx = pos.x - (point.x * this.scale + this.offset.x);
          const dy = pos.y - (point.y * this.scale + this.offset.y);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
              minDist = dist;
              nearest = { node, point };
          }
      });
  });
  
  return minDist < 20 ? nearest : null;
}

getMousePos(e) {
  const rect = this.canvas.getBoundingClientRect();
  return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
  };
}

addNode(x, y, width = 150, height = 80, text = 'Nuevo concepto', backgroundColor = '#ffffff', textColor = '#000000') {
  const node = {
      x: Math.max(width/2, Math.min(this.workspaceWidth - width/2, x)),
      y: Math.max(height/2, Math.min(this.workspaceHeight - height/2, y)),
      width,
      height,
      text,
      backgroundColor,
      textColor,
      fontSize: 14
  };
  
  this.nodes.push(node);
  this.selectedNode = node;
  this.render();
  return node;
}
}