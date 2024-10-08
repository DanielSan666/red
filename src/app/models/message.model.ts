// message.model.ts
export interface Message {
  text: string;           // Texto del mensaje
  sender: string;        // Nombre del usuario que envió el mensaje
  timestamp: number;     // Marca de tiempo del mensaje
  userId: string;        // ID del usuario
  nombre: string;        // Nombre para mostrar del usuario
}
