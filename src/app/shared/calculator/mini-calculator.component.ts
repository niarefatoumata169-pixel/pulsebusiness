import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mini-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mini-calc">
      <div class="mini-display">
        <input type="text" [(ngModel)]="display" readonly class="mini-input">
      </div>
      <div class="mini-buttons">
        <button class="mini-btn" (click)="addNumber('7')">7</button>
        <button class="mini-btn" (click)="addNumber('8')">8</button>
        <button class="mini-btn" (click)="addNumber('9')">9</button>
        <button class="mini-btn operator" (click)="addOperator('/')">÷</button>
        
        <button class="mini-btn" (click)="addNumber('4')">4</button>
        <button class="mini-btn" (click)="addNumber('5')">5</button>
        <button class="mini-btn" (click)="addNumber('6')">6</button>
        <button class="mini-btn operator" (click)="addOperator('*')">×</button>
        
        <button class="mini-btn" (click)="addNumber('1')">1</button>
        <button class="mini-btn" (click)="addNumber('2')">2</button>
        <button class="mini-btn" (click)="addNumber('3')">3</button>
        <button class="mini-btn operator" (click)="addOperator('-')">−</button>
        
        <button class="mini-btn" (click)="addNumber('0')">0</button>
        <button class="mini-btn" (click)="addDecimal()">.</button>
        <button class="mini-btn" (click)="clear()">C</button>
        <button class="mini-btn operator" (click)="calculate()">=</button>
      </div>
      <button class="mini-use" (click)="useResult()">Utiliser ce résultat</button>
    </div>
  `,
  styles: [`
    .mini-calc {
      background: white;
      border: 2px solid #FCE7F3;
      border-radius: 12px;
      padding: 15px;
      width: 250px;
    }
    .mini-display {
      background: #F9FAFB;
      border: 2px solid #FCE7F3;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
    }
    .mini-input {
      width: 100%;
      border: none;
      background: transparent;
      font-size: 20px;
      text-align: right;
      outline: none;
    }
    .mini-buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 5px;
      margin-bottom: 10px;
    }
    .mini-btn {
      background: #FDF2F8;
      border: 1px solid #FCE7F3;
      border-radius: 6px;
      padding: 10px;
      font-size: 14px;
      cursor: pointer;
    }
    .mini-btn.operator {
      background: #EC4899;
      color: white;
    }
    .mini-use {
      width: 100%;
      background: #EC4899;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 10px;
      cursor: pointer;
      font-size: 14px;
    }
  `]
})
export class MiniCalculatorComponent {
  display = '0';
  firstOperand: number | null = null;
  operator: string | null = null;
  waitingForSecond = false;
  
  @Output() result = new EventEmitter<number>();
  
  addNumber(num: string) {
    if (this.waitingForSecond) {
      this.display = num;
      this.waitingForSecond = false;
    } else {
      this.display = this.display === '0' ? num : this.display + num;
    }
  }
  
  addDecimal() {
    if (!this.display.includes('.')) {
      this.display += '.';
    }
  }
  
  clear() {
    this.display = '0';
    this.firstOperand = null;
    this.operator = null;
    this.waitingForSecond = false;
  }
  
  addOperator(op: string) {
    if (this.firstOperand === null) {
      this.firstOperand = parseFloat(this.display);
    } else if (this.operator) {
      this.calculate();
    }
    this.operator = op;
    this.waitingForSecond = true;
  }
  
  calculate() {
    if (this.firstOperand !== null && this.operator) {
      const second = parseFloat(this.display);
      let result = 0;
      
      switch (this.operator) {
        case '+': result = this.firstOperand + second; break;
        case '-': result = this.firstOperand - second; break;
        case '*': result = this.firstOperand * second; break;
        case '/': result = this.firstOperand / second; break;
      }
      
      this.display = (Math.round(result * 100) / 100).toString();
      this.firstOperand = null;
      this.operator = null;
      this.waitingForSecond = false;
    }
  }
  
  useResult() {
    this.result.emit(parseFloat(this.display));
  }
}
