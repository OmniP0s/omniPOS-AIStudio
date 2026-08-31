type OutboxMessage = {
  id?: string;
  eventType?: string;
  nodeId?: string;
  vectorClock?: Record<string, number>;
};

export function commitOutboxMessage(message: OutboxMessage) {
  if (!message || !message.id) {
    return { statusCode: 400, body: { error: "Invalid outbox message schema" } };
  }

  console.log(`[SYNC BUS] Ingested ${message.eventType} from node ${message.nodeId} (Clock: ${JSON.stringify(message.vectorClock)})`);

  return {
    statusCode: 200,
    body: {
      success: true,
      messageId: message.id,
      serverVectorClock: { "SERVER-PRIMARY": Date.now() },
      status: "COMMITTED",
      timestamp: new Date().toISOString(),
    },
  };
}
