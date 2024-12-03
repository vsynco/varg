
class ConceptMapCore {
    constructor(canvasId) {
        // Canvas y contexto
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Dimensiones
        this.workspaceWidth = 3000;
        this.workspaceHeight = 2000;
        
        // Estado del mapa
        this.nodes = [];
        this.connections = [];
        
        // Vista
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        this.minScale = 0.1;
        this.maxScale = 5;
        
        // Estado de la aplicación
        this.state = {
            showGrid: true,
            snapToGrid: true,
            gridSize: 20,
            isModified: false
        };

        // Configuración por defecto
        this.defaultStyles = {
            node: {
                width: 150,
                height: 80,
                backgroundColor: '#ffffff',
                borderColor: '#000000',
                textColor: '#000000',
                fontSize: 14,
                fontFamily: 'Arial',
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: 5,
                padding: 10,
                shadow: {
                    color: 'rgba(0,0,0,0.3)',
                    blur: 5,
                    offsetX: 2,
                    offsetY: 2
                }
            },
            connection: {
                lineWidth: 2,
                lineColor: '#000000',
                lineStyle: 'solid',
                arrowSize: 10
            }
        };
    }

    addNode(options = {}) {
        const defaultOptions = {...this.defaultStyles.node};
        const nodeOptions = {...defaultOptions, ...options};
        
        const node = {
            id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x: (this.canvas.width / 2 - this.offset.x) / this.scale,
            y: (this.canvas.height / 2 - this.offset.y) / this.scale,
            width: nodeOptions.width,
            height: nodeOptions.height,
            text: nodeOptions.text || 'Nuevo nodo',
            style: {
                backgroundColor: nodeOptions.style.backgroundColor,
                borderColor: nodeOptions.borderColor || '#000000',
                textColor: nodeOptions.style.textColor,
                fontSize: nodeOptions.fontSize || 14,
                fontFamily: nodeOptions.fontFamily || 'Arial',
                borderWidth: nodeOptions.borderWidth || 1,
                borderStyle: nodeOptions.borderStyle || 'solid',
                borderRadius: nodeOptions.borderRadius || 5,
                padding: nodeOptions.padding || 10,
                shadow: {...defaultOptions.shadow}
            },
            isSelected: false
        };

        this.nodes.push(node);
        this.state.isModified = true;
        return node;
    }

    addConnection(startNode, endNode, options = {}) {
        const connection = {
            id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            startNode: startNode,
            endNode: endNode,
            startPoint: options.startPoint,
            endPoint: options.endPoint,
            style: {...this.defaultStyles.connection},
            isSelected: false
        };

        this.connections.push(connection);
        this.state.isModified = true;
        return connection;
    }

    deleteNode(nodeId) {
        const index = this.nodes.findIndex(n => n.id === nodeId);
        if (index !== -1) {
            this.nodes.splice(index, 1);
            // Eliminar conexiones asociadas
            this.connections = this.connections.filter(
                conn => conn.startNode !== nodeId && conn.endNode !== nodeId
            );
            this.state.isModified = true;
        }
    }

    deleteConnection(connectionId) {
        const index = this.connections.findIndex(c => c.id === connectionId);
        if (index !== -1) {
            this.connections.splice(index, 1);
            this.state.isModified = true;
        }
    }

    getNodeById(id) {
        return this.nodes.find(node => node.id === id);
    }

    getConnectionById(id) {
        return this.connections.find(conn => conn.id === id);
    }

    getConnectionPoints(node) {
        return [
            { x: node.x, y: node.y - node.height/2, type: 'top' },
            { x: node.x + node.width/2, y: node.y, type: 'right' },
            { x: node.x, y: node.y + node.height/2, type: 'bottom' },
            { x: node.x - node.width/2, y: node.y, type: 'left' }
        ];
    }

    constrainOffset() {
        const maxOffsetX = Math.max(0, this.workspaceWidth * this.scale - this.canvas.width);
        const maxOffsetY = Math.max(0, this.workspaceHeight * this.scale - this.canvas.height);
        
        this.offset.x = Math.min(0, Math.max(-maxOffsetX, this.offset.x));
        this.offset.y = Math.min(0, Math.max(-maxOffsetY, this.offset.y));
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    toJSON() {
        return {
            nodes: this.nodes,
            connections: this.connections,
            state: this.state
        };
    }

    fromJSON(data) {
        this.nodes = data.nodes || [];
        this.connections = data.connections || [];
        this.state = {...this.state, ...data.state};
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
}