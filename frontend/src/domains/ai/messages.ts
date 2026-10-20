export const aiMessages = {
  insights: {
    title: 'Notificaciones de Cashy',
    disabled: 'El asistente IA no está configurado.',
    loading: 'Analizando tus finanzas...',
    error: 'No pudimos generar las notificaciones. Probá de nuevo.',
    empty: 'Todo en orden, no hay novedades por ahora.',
    refresh: 'Actualizar',
    refreshing: 'Actualizando...',
    tones: {
      alerta: 'Alerta',
      sugerencia: 'Sugerencia',
      info: 'Dato'
    }
  },
  chat: {
    fabLabel: 'Abrir el asistente Cashy',
    panelLabel: 'Asistente Cashy',
    title: 'Cashy',
    subtitle: 'Tu asistente financiero',
    closeLabel: 'Cerrar el asistente',
    empty:
      'Preguntame lo que quieras sobre tus finanzas, o pedime que agregue o borre algo: "agrega 300.000 al gimnasio".',
    thinking: 'Pensando...',
    inputPlaceholder: 'Escribí tu pregunta',
    listeningPlaceholder: 'Escuchando...',
    send: 'Enviar',
    dictate: 'Dictar',
    stopDictating: 'Detener dictado',
    readAloud: 'Leer en voz alta',
    speak: 'Escuchar',
    stopSpeak: 'Detener',
    proposalsTitle: 'Cashy propone',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    executing: 'Ejecutando...',
    done: 'Hecho',
    cancelled: 'Cancelado',
    fallbackReplyError: 'No pudimos responder. Probá de nuevo.',
    fallbackActionError: 'No pudimos ejecutar la acción.'
  }
} as const;
