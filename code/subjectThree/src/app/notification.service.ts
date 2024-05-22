import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private renderer: Renderer2;
  private notifications: HTMLElement[] = [];

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  showNotification(message: string): void {
    const notification = this.renderer.createElement('div');
    this.renderer.setStyle(notification, 'position', 'fixed');
    this.renderer.setStyle(notification, 'right', '20px');
    this.renderer.setStyle(notification, 'backgroundColor', 'rgba(0, 0, 0, 0.7)');
    this.renderer.setStyle(notification, 'color', 'white');
    this.renderer.setStyle(notification, 'padding', '10px 20px');
    this.renderer.setStyle(notification, 'borderRadius', '5px');
    this.renderer.setStyle(notification, 'boxShadow', '0 2px 10px rgba(0, 0, 0, 0.2)');
    this.renderer.setStyle(notification, 'zIndex', '1000');
    this.renderer.setStyle(notification, 'transition', 'opacity 0.5s');

    const text = this.renderer.createText(message);
    this.renderer.appendChild(notification, text);
    this.renderer.appendChild(document.body, notification);

    this.notifications.push(notification);
    this.updateNotificationPositions();

    setTimeout(() => {
      this.renderer.setStyle(notification, 'opacity', '0');
      setTimeout(() => {
        this.renderer.removeChild(document.body, notification);
        this.notifications = this.notifications.filter(n => n !== notification);
        this.updateNotificationPositions();
      }, 500);
    }, 4500);
  }

  private updateNotificationPositions(): void {
    let offset = 20; // Initial top offset
    this.notifications.forEach(notification => {
      this.renderer.setStyle(notification, 'top', `${offset}px`);
      offset += notification.offsetHeight + 10; // 10px gap between notifications
    });
  }
}
