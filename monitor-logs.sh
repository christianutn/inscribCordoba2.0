#!/bin/bash

# 📊 Script de Monitoreo de Logs - InscribCordoba
# Uso: ./monitor-logs.sh [opcion]
#
# Opciones:
#   actions   - Ver logs de acciones en tiempo real
#   errors    - Ver solo errores en tiempo real
#   access    - Ver logs HTTP en tiempo real
#   search    - Buscar un término en los logs
#   stats     - Ver estadísticas de logs

CONTAINER_NAME="inscribcordoba-backend"
LOG_DIR="/app/logs"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar el menú
show_menu() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  📊 Monitor de Logs - InscribCordoba  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}1)${NC} Ver logs de acciones (tiempo real)"
    echo -e "${GREEN}2)${NC} Ver logs de errores (tiempo real)"
    echo -e "${GREEN}3)${NC} Ver logs de acceso HTTP (tiempo real)"
    echo -e "${GREEN}4)${NC} Ver últimas 50 líneas de acciones"
    echo -e "${GREEN}5)${NC} Ver últimas 50 líneas de errores"
    echo -e "${GREEN}6)${NC} Buscar texto en logs"
    echo -e "${GREEN}7)${NC} Ver estadísticas"
    echo -e "${GREEN}8)${NC} Limpiar logs antiguos (>7 días)"
    echo -e "${GREEN}9)${NC} Exportar logs a archivo"
    echo -e "${RED}0)${NC} Salir"
    echo ""
}

# Función para verificar si el contenedor está corriendo
check_container() {
    if ! docker ps | grep -q $CONTAINER_NAME; then
        echo -e "${RED}❌ El contenedor $CONTAINER_NAME no está corriendo${NC}"
        exit 1
    fi
}

# 1. Ver logs de acciones en tiempo real
view_actions_live() {
    echo -e "${YELLOW}📋 Siguiendo logs de acciones... (Ctrl+C para salir)${NC}"
    docker exec -it $CONTAINER_NAME tail -f $LOG_DIR/actions.log
}

# 2. Ver logs de errores en tiempo real
view_errors_live() {
    echo -e "${RED}❌ Siguiendo logs de errores... (Ctrl+C para salir)${NC}"
    docker exec -it $CONTAINER_NAME tail -f $LOG_DIR/errors.log
}

# 3. Ver logs de acceso HTTP
view_access_live() {
    echo -e "${BLUE}🌐 Siguiendo logs HTTP... (Ctrl+C para salir)${NC}"
    docker exec -it $CONTAINER_NAME tail -f $LOG_DIR/access.log
}

# 4. Ver últimas 50 líneas de acciones
view_actions_tail() {
    echo -e "${YELLOW}📋 Últimas 50 líneas de acciones:${NC}"
    docker exec $CONTAINER_NAME tail -n 50 $LOG_DIR/actions.log
}

# 5. Ver últimas 50 líneas de errores
view_errors_tail() {
    echo -e "${RED}❌ Últimas 50 líneas de errores:${NC}"
    docker exec $CONTAINER_NAME tail -n 50 $LOG_DIR/errors.log
}

# 6. Buscar en logs
search_logs() {
    echo -e "${YELLOW}🔍 Ingresa el texto a buscar:${NC}"
    read search_term
    
    echo ""
    echo -e "${BLUE}Buscando '$search_term' en actions.log:${NC}"
    docker exec $CONTAINER_NAME grep -i "$search_term" $LOG_DIR/actions.log | tail -n 20
    
    echo ""
    echo -e "${RED}Buscando '$search_term' en errors.log:${NC}"
    docker exec $CONTAINER_NAME grep -i "$search_term" $LOG_DIR/errors.log | tail -n 20
}

# 7. Ver estadísticas
view_stats() {
    echo -e "${BLUE}📊 Estadísticas de Logs${NC}"
    echo "─────────────────────────────────────"
    
    # Total de líneas por archivo
    echo -e "${GREEN}Total de líneas:${NC}"
    echo -n "  actions.log: "
    docker exec $CONTAINER_NAME wc -l $LOG_DIR/actions.log 2>/dev/null | awk '{print $1}' || echo "0"
    echo -n "  errors.log:  "
    docker exec $CONTAINER_NAME wc -l $LOG_DIR/errors.log 2>/dev/null | awk '{print $1}' || echo "0"
    echo -n "  access.log:  "
    docker exec $CONTAINER_NAME wc -l $LOG_DIR/access.log 2>/dev/null | awk '{print $1}' || echo "0"
    
    echo ""
    echo -e "${YELLOW}Tamaño de archivos:${NC}"
    docker exec $CONTAINER_NAME ls -lh $LOG_DIR/*.log 2>/dev/null | awk '{print "  "$9": "$5}'
    
    echo ""
    echo -e "${RED}Errores recientes (últimos 10):${NC}"
    docker exec $CONTAINER_NAME grep -i "ERROR" $LOG_DIR/errors.log 2>/dev/null | tail -n 10 || echo "  No hay errores"
}

# 8. Limpiar logs antiguos
clean_old_logs() {
    echo -e "${YELLOW}⚠️  ¿Estás seguro que quieres limpiar logs antiguos? (s/n)${NC}"
    read confirm
    
    if [ "$confirm" = "s" ]; then
        echo -e "${BLUE}Limpiando logs...${NC}"
        docker exec $CONTAINER_NAME sh -c "find $LOG_DIR -name '*.log' -mtime +7 -delete"
        echo -e "${GREEN}✅ Logs antiguos eliminados${NC}"
    else
        echo -e "${RED}Operación cancelada${NC}"
    fi
}

# 9. Exportar logs
export_logs() {
    EXPORT_DIR="./logs_export_$(date +%Y%m%d_%H%M%S)"
    mkdir -p $EXPORT_DIR
    
    echo -e "${BLUE}📦 Exportando logs a $EXPORT_DIR${NC}"
    
    docker cp $CONTAINER_NAME:$LOG_DIR/actions.log $EXPORT_DIR/ 2>/dev/null && echo "  ✅ actions.log exportado"
    docker cp $CONTAINER_NAME:$LOG_DIR/errors.log $EXPORT_DIR/ 2>/dev/null && echo "  ✅ errors.log exportado"
    docker cp $CONTAINER_NAME:$LOG_DIR/access.log $EXPORT_DIR/ 2>/dev/null && echo "  ✅ access.log exportado"
    
    echo -e "${GREEN}✅ Logs exportados a: $EXPORT_DIR${NC}"
}

# Verificar que el contenedor está corriendo
check_container

# Si se pasa un argumento, ejecutar directamente
if [ ! -z "$1" ]; then
    case $1 in
        actions) view_actions_live ;;
        errors) view_errors_live ;;
        access) view_access_live ;;
        search) search_logs ;;
        stats) view_stats ;;
        *) echo "Opción inválida. Usa: actions, errors, access, search, stats" ;;
    esac
    exit 0
fi

# Menú interactivo
while true; do
    show_menu
    read -p "Selecciona una opción: " option
    
    case $option in
        1) view_actions_live ;;
        2) view_errors_live ;;
        3) view_access_live ;;
        4) view_actions_tail ;;
        5) view_errors_tail ;;
        6) search_logs ;;
        7) view_stats ;;
        8) clean_old_logs ;;
        9) export_logs ;;
        0) echo -e "${GREEN}👋 Hasta luego!${NC}"; exit 0 ;;
        *) echo -e "${RED}❌ Opción inválida${NC}" ;;
    esac
    
    echo ""
    read -p "Presiona Enter para continuar..."
    clear
done
