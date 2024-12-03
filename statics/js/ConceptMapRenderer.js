class ConceptMapRenderer {
    constructor(core) {
        this.core = core;
        this.ctx = core.ctx;
        
        // Caché de imágenes y gradientes
        this.imageCache = new Map();
        this.gradientCache = new Map();
        
        // Estilo del grid
        this.gridStyle = {
            major: {
                color: '#e0e0e0',
                spacing: 100,
                lineWidth: 1
            },
            minor: {
                color: '#f0f0f0',
                spacing: 20,
                lineWidth: 0.5
            }
        };

        // Temas predefinidos
        this.themes = {
            default: {
                background: '#ffffff',
                grid: true,
                shadows: true
            },
            dark: {
                background: '#2d2d2d',
                grid: true,
                shadows: true,
                nodeDefaults: {
                    backgroundColor: '#3d3d3d',
                    textColor: '#ffffff',
                    borderColor: '#4d4d4d'
                }
            },
            modern: {
                background: '#f5f5f5',
                grid: true,
                shadows: true,
                nodeDefaults: {
                    backgroundColor: '#ffffff',
                    textColor: '#333333',
                    borderColor: '#dddddd',
                    borderRadius: 10
                }
            }
        };

        // Estado de animación
        this.animations = new Set();
        this.isAnimating = false;
    }

    render() {
        this.ctx.clearRect(0, 0, this.core.canvas.width, this.core.canvas.height);
        this.ctx.save();

        // Aplicar transformaciones globales
        this.ctx.translate(this.core.offset.x, this.core.offset.y);
        this.ctx.scale(this.core.scale, this.core.scale);

        // Dibujar fondo y grid
        this.renderBackground();
        if (this.core.state.showGrid) {
            this.renderGrid();
        }

        // Renderizar por capas
        this.core.layers.forEach((layer, index) => {
            if (layer.visible) {
                this.renderLayer(layer);
            }
        });

        // Renderizar elementos de interacción
        this.renderInteractionElements();

        this.ctx.restore();

        // Renderizar interfaz
        this.renderUI();

        // Continuar animaciones si existen
        if (this.animations.size > 0) {
            requestAnimationFrame(() => this.render());
        }
    }

    renderBackground() {
        const theme = this.themes[this.core.state.currentTheme];
        this.ctx.fillStyle = theme.background;
        this.ctx.fillRect(0, 0, this.core.workspaceWidth, this.core.workspaceHeight);

        // Renderizar patrón de fondo si existe
        if (theme.backgroundPattern) {
            this.renderBackgroundPattern(theme.backgroundPattern);
        }
    }

    renderGrid() {
        const { major, minor } = this.gridStyle;
        
        // Calcular límites visibles
        const visibleBounds = this.getVisibleBounds();
        
        // Grid menor
        this.ctx.beginPath();
        this.ctx.strokeStyle = minor.color;
        this.ctx.lineWidth = minor.lineWidth;

        for (let x = visibleBounds.left; x < visibleBounds.right; x += minor.spacing) {
            this.ctx.moveTo(x, visibleBounds.top);
            this.ctx.lineTo(x, visibleBounds.bottom);
        }
        for (let y = visibleBounds.top; y < visibleBounds.bottom; y += minor.spacing) {
            this.ctx.moveTo(visibleBounds.left, y);
            this.ctx.lineTo(visibleBounds.right, y);
        }
        this.ctx.stroke();

        // Grid mayor
        this.ctx.beginPath();
        this.ctx.strokeStyle = major.color;
        this.ctx.lineWidth = major.lineWidth;

        for (let x = visibleBounds.left; x < visibleBounds.right; x += major.spacing) {
            this.ctx.moveTo(x, visibleBounds.top);
            this.ctx.lineTo(x, visibleBounds.bottom);
        }
        for (let y = visibleBounds.top; y < visibleBounds.bottom; y += major.spacing) {
            this.ctx.moveTo(visibleBounds.left, y);
            this.ctx.lineTo(visibleBounds.right, y);
        }
        this.ctx.stroke();
    }

    getVisibleBounds() {
        return {
            left: -this.core.offset.x / this.core.scale,
            top: -this.core.offset.y / this.core.scale,
            right: (this.core.canvas.width - this.core.offset.x) / this.core.scale,
            bottom: (this.core.canvas.height - this.core.offset.y) / this.core.scale
        };
    }

    renderLayer(layer) {
        // Renderizar grupos primero
        this.core.groups
            .filter(group => group.layer === layer.id)
            .forEach(group => this.renderGroup(group));

        // Renderizar conexiones
        layer.connections
            .map(id => this.core.getConnectionById(id))
            .filter(conn => conn)
            .forEach(conn => this.renderConnection(conn));

        // Renderizar nodos
        layer.nodes
            .map(id => this.core.getNodeById(id))
            .filter(node => node)
            .forEach(node => this.renderNode(node));
    }

    renderGroup(group) {
        const bounds = this.getGroupBounds(group);
        const padding = 20;

        // Dibujar fondo del grupo
        this.ctx.fillStyle = 'rgba(200, 200, 200, 0.2)';
        this.ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        this.ctx.lineWidth = 2;
        
        this.roundRect(
            bounds.left - padding,
            bounds.top - padding,
            bounds.right - bounds.left + 2*padding,
            bounds.bottom - bounds.top + 2*padding,
            10
        );

        // Dibujar título del grupo si existe
        if (group.name) {
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = '#666666';
            this.ctx.fillText(
                group.name,
                bounds.left,
                bounds.top - padding - 5
            );
        }
    }

    renderNode(node) {
        this.ctx.save();

        // Aplicar transformación del nodo
        this.ctx.translate(node.x, node.y);
        this.ctx.rotate(node.rotation || 0);

        // Aplicar sombra si corresponde
        if (node.style.shadow && this.themes[this.core.state.currentTheme].shadows) {
            this.ctx.shadowColor = node.style.shadow.color;
            this.ctx.shadowBlur = node.style.shadow.blur;
            this.ctx.shadowOffsetX = node.style.shadow.offsetX;
            this.ctx.shadowOffsetY = node.style.shadow.offsetY;
        }

        // Renderizar según el tipo de nodo
        switch (node.type) {
            case 'rectangle':
                this.renderRectangleNode(node);
                break;
            case 'ellipse':
                this.renderEllipseNode(node);
                break;
            case 'diamond':
                this.renderDiamondNode(node);
                break;
            case 'cloud':
                this.renderCloudNode(node);
                break;
            case 'hexagon':
                this.renderHexagonNode(node);
                break;
            case 'custom':
                this.renderCustomNode(node);
                break;
        }

        // Limpiar sombra
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Renderizar contenido
        this.renderNodeContent(node);

        // Renderizar elementos de selección si está seleccionado
        if (node.isSelected) {
            this.renderSelectionIndicators(node);
        }

        // Renderizar puntos de conexión si está seleccionado o hover
        if (node.isSelected || node === this.core.interaction.hoveredNode) {
            this.renderConnectionPoints(node);
        }

        this.ctx.restore();
    }

    renderRectangleNode(node) {
        const w = node.width;
        const h = node.height;
        const r = node.style.borderRadius || 0;

        this.ctx.beginPath();
        if (r > 0) {
            this.roundRect(-w/2, -h/2, w, h, r);
        } else {
            this.ctx.rect(-w/2, -h/2, w, h);
        }

        // Aplicar gradient o color sólido
        if (node.style.gradient) {
            const gradient = this.createGradient(node.style.gradient, -w/2, -h/2, w/2, h/2);
            this.ctx.fillStyle = gradient;
        } else {
            this.ctx.fillStyle = node.style.backgroundColor;
        }

        this.ctx.fill();

        // Aplicar borde
        if (node.style.borderWidth > 0) {
            this.ctx.strokeStyle = node.style.borderColor;
            this.ctx.lineWidth = node.style.borderWidth;
            
            if (node.style.borderStyle === 'dashed') {
                this.ctx.setLineDash([5, 3]);
            }
            
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }

    renderNodeContent(node) {
        const padding = node.style.padding || 10;
        const maxWidth = node.width - 2 * padding;
        const maxHeight = node.height - 2 * padding;

        // Renderizar imagen si existe
        if (node.image) {
            this.renderNodeImage(node, maxWidth, maxHeight);
        }

        // Renderizar texto
        if (node.text) {
            this.renderNodeText(node, maxWidth, maxHeight);
        }

        // Renderizar iconos si existen
        if (node.icons) {
            this.renderNodeIcons(node);
        }
    }

    renderNodeText(node, maxWidth, maxHeight) {
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = node.style.textColor;
        this.ctx.font = `${node.style.fontStyle || ''} ${node.style.fontSize}px ${node.style.fontFamily}`;

        const lines = this.getTextLines(node.text, maxWidth);
        const lineHeight = node.style.fontSize * 1.2;
        const totalHeight = lineHeight * lines.length;
        let startY = -totalHeight/2;

        if (node.image) {
            startY += node.imageSize.height/2 + 10; // Ajustar posición si hay imagen
        }

        lines.forEach((line, i) => {
            this.ctx.fillText(line, 0, startY + i * lineHeight);
        });
    }

    renderConnectionPoints(node) {
        const points = [
            { x: 0, y: -node.height/2, type: 'top' },
            { x: node.width/2, y: 0, type: 'right' },
            { x: 0, y: node.height/2, type: 'bottom' },
            { x: -node.width/2, y: 0, type: 'left' }
        ];

        points.forEach(point => {
            const isHovered = this.core.interaction.hoveredPoint &&
                            this.core.interaction.hoveredPoint.type === point.type;

            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, isHovered ? 6 : 4, 0, Math.PI * 2);
            this.ctx.fillStyle = isHovered ? '#ff4444' : '#0066cc';
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }

    renderConnection(conn) {
        const startNode = this.core.getNodeById(conn.startNode);
        const endNode = this.core.getNodeById(conn.endNode);
        if (!startNode || !endNode) return;

        this.ctx.save();
        
        // Establecer estilo de línea
        if (conn.style.gradient) {
            const gradient = this.createGradient(
                conn.style.gradient,
                conn.startPoint.x,
                conn.startPoint.y,
                conn.endPoint.x,
                conn.endPoint.y
            );
            this.ctx.strokeStyle = gradient;
        } else {
            this.ctx.strokeStyle = conn.style.lineColor;
        }

        this.ctx.lineWidth = conn.style.lineWidth;
        
        if (conn.style.lineStyle === 'dashed') {
            this.ctx.setLineDash([5, 3]);
        }

        // Dibujar línea según el tipo
        switch (conn.type) {
            case 'straight':
                this.renderStraightConnection(conn);
                break;
            case 'curved':
                this.renderCurvedConnection(conn);
                break;
            case 'orthogonal':
                this.renderOrthogonalConnection(conn);
                break;
        }

        this.ctx.restore();

        // Renderizar etiqueta si existe
        if (conn.text) {
            this.renderConnectionLabel(conn);
        }

        // Renderizar puntos de control si está seleccionada
        if (conn.isSelected) {
            this.renderConnectionControls(conn);
        }
    }

    renderCurvedConnection(conn) {
        const start = conn.startPoint;
        const end = conn.endPoint;
        const ctrl1 = conn.controlPoints?.[0] || this.calculateControlPoint(start, end, 0.3);
        const ctrl2 = conn.controlPoints?.[1] || this.calculateControlPoint(end, start, 0.3);

        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.bezierCurveTo(
            ctrl1.x, ctrl1.y,
            ctrl2.x, ctrl2.y,
            end.x, end.y
        );
        this.ctx.stroke();

        // Dibujar flecha
        this.renderArrow(end, ctrl2);
    }

    renderConnectionLabel(conn) {
        const midPoint = this.getConnectionMidpoint(conn);
        this.ctx.save();

        // Calcular ángulo de la línea para rotar el texto
        const angle = Math.atan2(
            conn.endPoint.y - conn.startPoint.y,
            conn.endPoint.x - conn.startPoint.x
        );

        this.ctx.translate(midPoint.x, midPoint.y);
        this.ctx.rotate(angle);

        // Fondo del texto
        const textMetrics = this.ctx.measureText(conn.text);
        const padding = 4;
        const boxWidth = textMetrics.width + padding * 2;
        const boxHeight = conn.style.fontSize + padding * 2;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.roundRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight, 4);
        this.ctx.fill();

        // Texto
        this.ctx.fillStyle = conn.style.textColor;
        this.ctx.font = `${conn.style.fontSize}px ${conn.style.fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(conn.text, 0, 0);

        this.ctx.restore();
    }

    // Utilidades
    createGradient(gradientSpec, x1, y1, x2, y2) {
        const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        gradientSpec.stops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
        });
        return gradient;
    }

    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    getTextLines(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const metrics = this.ctx.measureText(testLine);
            
            if (metrics.width > maxWidth) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    calculateControlPoint(start, end, factor) {
        return {
            x: start.x + (end.x - start.x) * factor,
            y: start.y + (end.y - start.y) * factor
        };
    }

    getConnectionMidpoint(conn) {
        if (conn.type === 'curved' && conn.controlPoints) {
            // Calcular punto medio en curva Bezier
            const t = 0.5;
            const p0 = conn.startPoint;
            const p1 = conn.controlPoints[0];
            const p2 = conn.controlPoints[1];
            const p3 = conn.endPoint;

            return {
                x: Math.pow(1-t, 3) * p0.x +
                   3 * Math.pow(1-t, 2) * t * p1.x +
                   3 * (1-t) * Math.pow(t, 2) * p2.x +
                   Math.pow(t, 3) * p3.x,
                y: Math.pow(1-t, 3) * p0.y +
                   3 * Math.pow(1-t, 2) * t * p1.y +
                   3 * (1-t) * Math.pow(t, 2) * p2.y +
                   Math.pow(t, 3) * p3.y
            };
        } else {
            // Punto medio en línea recta
            return {
                x: (conn.startPoint.x + conn.endPoint.x) / 2,
                y: (conn.startPoint.y + conn.endPoint.y) / 2
            };
        }
    }
}