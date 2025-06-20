
type DriveEvent = "refresh";

type EventHandler = () => void;

class DriveEventBus {
  private listeners: Record<DriveEvent, Set<EventHandler>> = {
    refresh: new Set(),
  };

  on(event: DriveEvent, handler: EventHandler) {
    this.listeners[event].add(handler);
    return () => this.off(event, handler);
  }

  off(event: DriveEvent, handler: EventHandler) {
    this.listeners[event].delete(handler);
  }

  emit(event: DriveEvent) {
    for (const handler of this.listeners[event]) {
      handler();
    }
  }
}

export const driveEventBus = new DriveEventBus();
