import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InAppNotificationService } from '../../../core/services/in-app-notification.service';
import { AppNotification } from '../../../core/models/notification.model';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <button class="bell-btn" (click)="toggleDropdown()">
        <span class="bell-icon">🔔</span>
        <span class="unread-count" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
      </button>

      <div class="dropdown-panel" *ngIf="showDropdown">
        <div class="dropdown-header">
          <h3>Notifications</h3>
          <button (click)="markAllRead()" *ngIf="unreadCount > 0" class="mark-all-btn">Mark all read</button>
        </div>
        
        <div class="notification-list">
          <div *ngIf="notifications.length === 0" class="empty-notif">
            No new notifications
          </div>
          
          <div *ngFor="let n of notifications" 
               class="notif-item" 
               [class.unread]="!n.isRead"
               (click)="markRead(n)">
            <div class="notif-title">{{ n.title }}</div>
            <div class="notif-msg">{{ n.message }}</div>
            <div class="notif-time">{{ n.createdAt | date:'short' }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container { position: relative; display: inline-block; margin-right: 1rem; }
    .bell-btn { background: transparent; border: none; cursor: pointer; position: relative; padding: 5px; font-size: 1.5rem; }
    .unread-count {
      position: absolute; top: 0; right: 0;
      background: #ef4444; color: white;
      font-size: 0.65rem; font-weight: bold;
      padding: 0.1rem 0.35rem; border-radius: 99px;
      border: 2px solid white;
    }
    .dropdown-panel {
      position: absolute; right: 0; top: 40px;
      width: 300px; max-height: 400px;
      background: white; border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0; z-index: 1000;
      overflow: hidden; display: flex; flex-direction: column;
    }
    .dropdown-header {
      padding: 1rem; border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: center;
    }
    .dropdown-header h3 { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0; }
    .mark-all-btn { font-size: 0.75rem; color: #3b82f6; background: none; border: none; cursor: pointer; }
    .mark-all-btn:hover { text-decoration: underline; }
    .notification-list { overflow-y: auto; flex-grow: 1; }
    .empty-notif { padding: 2rem; text-align: center; color: #64748b; font-size: 0.9rem; }
    .notif-item {
      padding: 0.75rem 1rem; border-bottom: 1px solid #f8fafc;
      cursor: pointer; transition: background 0.2s;
    }
    .notif-item:hover { background: #f8fafc; }
    .notif-item.unread { background: #eff6ff; border-left: 3px solid #3b82f6; }
    .notif-title { font-weight: 600; font-size: 0.85rem; color: #1e293b; }
    .notif-msg { font-size: 0.8rem; color: #64748b; margin-top: 2px; }
    .notif-time { font-size: 0.7rem; color: #94a3b8; margin-top: 4px; }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  unreadCount = 0;
  showDropdown = false;
  private pollSub?: Subscription;

  constructor(private notifService: InAppNotificationService) {}

  ngOnInit(): void {
    this.refresh();
    // Poll for new notifications every 60 seconds
    this.pollSub = interval(60000).subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  refresh() {
    this.notifService.getMyNotifications().subscribe(data => {
      this.notifications = data;
    });
    this.notifService.getUnreadCount().subscribe(res => {
      this.unreadCount = res.count;
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  markRead(n: AppNotification) {
    if (n.id !== undefined && !n.isRead) {
      this.notifService.markAsRead(n.id).subscribe(() => {
        n.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      });
    }
  }

  markAllRead() {
    this.notifService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
    });
  }
}
