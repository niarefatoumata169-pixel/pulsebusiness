import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  isVisible = false;
  selectedDate: Date | null = null;
  memo: string | null = null;

  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();

  weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  @Output() dateSelected = new EventEmitter<Date>();

  get days(): any[] {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = dimanche
    let startOffset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate();

    const daysArray = [];

    // Jours du mois précédent
    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNumber = prevMonthDays - i;
      daysArray.push({
        dayNumber,
        date: new Date(this.currentYear, this.currentMonth - 1, dayNumber),
        otherMonth: true
      });
    }

    // Jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push({
        dayNumber: i,
        date: new Date(this.currentYear, this.currentMonth, i),
        otherMonth: false
      });
    }

    // Compléter avec les jours du mois suivant pour atteindre 42 cases
    const totalCells = 42;
    const remaining = totalCells - daysArray.length;
    for (let i = 1; i <= remaining; i++) {
      daysArray.push({
        dayNumber: i,
        date: new Date(this.currentYear, this.currentMonth + 1, i),
        otherMonth: true
      });
    }

    return daysArray;
  }

  toggleCalendar(): void {
    this.isVisible = !this.isVisible;
  }

  hideCalendar(): void {
    this.isVisible = false;
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.dateSelected.emit(date);
  }

  isSelected(date: Date): boolean {
    if (!this.selectedDate) return false;
    return date.toDateString() === this.selectedDate.toDateString();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  saveToMemo(): void {
    if (this.selectedDate) {
      this.memo = this.selectedDate.toISOString().split('T')[0];
    }
  }

  useMemo(): void {
    if (this.memo) {
      const date = new Date(this.memo);
      if (!isNaN(date.getTime())) {
        this.selectedDate = date;
        this.currentMonth = date.getMonth();
        this.currentYear = date.getFullYear();
        this.dateSelected.emit(date);
      }
    }
  }

  clearMemo(): void {
    this.memo = null;
  }
}