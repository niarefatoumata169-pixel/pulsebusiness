import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calculator-container" [class.visible]="isVisible">
      <!-- Bouton toggle -->
      <button class="calc-toggle" (click)="toggleCalculator()">
        <span class="calc-icon">{{ isVisible ? '✕' : '🧮' }}</span>
      </button>
      
      <!-- Calculatrice -->
      <div class="calculator">
        <div class="calc-header">
          <span>Calculatrice</span>
          <button class="calc-close" (click)="hideCalculator()">✕</button>
        </div>
        
        <div class="calc-display">
          <input type="text" [(ngModel)]="display" readonly class="calc-input">
          <div class="calc-memo" *ngIf="memo">Mémo: {{ memo }}</div>
        </div>
        
        <div class="calc-buttons">
          <button class="calc-btn function" (click)="clear()">C</button>
          <button class="calc-btn function" (click)="toggleSign()">±</button>
          <button class="calc-btn function" (click)="percent()">%</button>
          <button class="calc-btn operator" (click)="addOperator('/')">÷</button>
          
          <button class="calc-btn" (click)="addNumber('7')">7</button>
          <button class="calc-btn" (click)="addNumber('8')">8</button>
          <button class="calc-btn" (click)="addNumber('9')">9</button>
          <button class="calc-btn operator" (click)="addOperator('*')">×</button>
          
          <button class="calc-btn" (click)="addNumber('4')">4</button>
          <button class="calc-btn" (click)="addNumber('5')">5</button>
          <button class="calc-btn" (click)="addNumber('6')">6</button>
          <button class="calc-btn operator" (click)="addOperator('-')">−</button>
          
          <button class="calc-btn" (click)="addNumber('1')">1</button>
          <button class="calc-btn" (click)="addNumber('2')">2</button>
          <button class="calc-btn" (click)="addNumber('3')">3</button>
          <button class="calc-btn operator" (click)="addOperator('+')">+</button>
          
          <button class="calc-btn zero" (click)="addNumber('0')">0</button>
          <button class="calc-btn" (click)="addDecimal()">.</button>
          <button class="calc-btn operator" (click)="calculate()">=</button>
        </div>
        
        <div class="calc-footer">
          <button class="calc-memo-btn" (click)="saveToMemo()">📝 Mémoriser</button>
          <button class="calc-memo-btn" (click)="useMemo()">📋 Utiliser</button>
          <button class="calc-memo-btn" (click)="clearMemo()">🗑️ Effacer mémo</button>
        </div>
        
        <div class="calc-shortcuts">
          <small>Raccourcis: Entrée =, Échap = C</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calculator-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    }
    
    .calc-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #EC4899;
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(236,72,153,0.3);
      transition: all 0.3s;
      position: absolute;
      bottom: 0;
      right: 0;
      z-index: 2;
    }
    
    .calc-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(236,72,153,0.4);
    }
    
    .calculator {
      width: 320px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      padding: 15px;
      position: absolute;
      bottom: 70px;
      right: 0;
      display: none;
      border: 2px solid #FCE7F3;
    }
    
    .calculator-container.visible .calculator {
      display: block;
    }
    
    .calc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      color: #1F2937;
      font-weight: 600;
    }
    
    .calc-close {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #6B7280;
    }
    
    .calc-display {
      background: #F9FAFB;
      border: 2px solid #FCE7F3;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 15px;
    }
    
    .calc-input {
      width: 100%;
      border: none;
      background: transparent;
      font-size: 24px;
      text-align: right;
      outline: none;
      color: #1F2937;
    }
    
    .calc-memo {
      font-size: 12px;
      color: #EC4899;
      text-align: right;
      margin-top: 5px;
      border-top: 1px dashed #FCE7F3;
      padding-top: 5px;
    }
    
    .calc-buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 15px;
    }
    
    .calc-btn {
      background: #FDF2F8;
      border: 1px solid #FCE7F3;
      border-radius: 8px;
      padding: 15px 0;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s;
      color: #1F2937;
    }
    
    .calc-btn:hover {
      background: #FCE7F3;
      transform: scale(0.95);
    }
    
    .calc-btn.operator {
      background: #EC4899;
      color: white;
      border-color: #DB2777;
    }
    
    .calc-btn.operator:hover {
      background: #DB2777;
    }
    
    .calc-btn.function {
      background: #E5E7EB;
      color: #4B5563;
    }
    
    .calc-btn.zero {
      grid-column: span 2;
    }
    
    .calc-footer {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }
    
    .calc-memo-btn {
      background: #FDF2F8;
      border: 1px solid #FCE7F3;
      border-radius: 6px;
      padding: 8px 0;
      font-size: 12px;
      cursor: pointer;
      color: #EC4899;
    }
    
    .calc-memo-btn:hover {
      background: #FCE7F3;
    }
    
    .calc-shortcuts {
      text-align: center;
      color: #9CA3AF;
      font-size: 11px;
    }
  `]
})
export class CalculatorComponent {
  isVisible = false;
  display = '0';
  firstOperand: number | null = null;
  operator: string | null = null;
  waitingForSecond = false;
  memo: string | null = null;
  
  toggleCalculator() {
    this.isVisible = !this.isVisible;
  }
  
  hideCalculator() {
    this.isVisible = false;
  }
  
  addNumber(num: string) {
    if (this.waitingForSecond) {
      this.display = num;
      this.waitingForSecond = false;
    } else {
      this.display = this.display === '0' ? num : this.display + num;
    }
  }
  
  addDecimal() {
    if (this.waitingForSecond) {
      this.display = '0.';
      this.waitingForSecond = false;
    } else if (!this.display.includes('.')) {
      this.display += '.';
    }
  }
  
  clear() {
    this.display = '0';
    this.firstOperand = null;
    this.operator = null;
    this.waitingForSecond = false;
  }
  
  toggleSign() {
    this.display = (parseFloat(this.display) * -1).toString();
  }
  
  percent() {
    this.display = (parseFloat(this.display) / 100).toString();
  }
  
  addOperator(op: string) {
    if (this.firstOperand === null) {
      this.firstOperand = parseFloat(this.display);
    } else if (this.operator) {
      const result = this.performCalculation();
      this.display = result.toString();
      this.firstOperand = result;
    }
    this.operator = op;
    this.waitingForSecond = true;
  }
  
  calculate() {
    if (this.firstOperand !== null && this.operator) {
      const result = this.performCalculation();
      this.display = result.toString();
      this.firstOperand = null;
      this.operator = null;
      this.waitingForSecond = false;
    }
  }
  
  performCalculation(): number {
    const second = parseFloat(this.display);
    let result = 0;
    
    switch (this.operator) {
      case '+':
        result = this.firstOperand! + second;
        break;
      case '-':
        result = this.firstOperand! - second;
        break;
      case '*':
        result = this.firstOperand! * second;
        break;
      case '/':
        result = this.firstOperand! / second;
        break;
      default:
        result = second;
    }
    
    return Math.round(result * 100) / 100;
  }
  
  saveToMemo() {
    this.memo = this.display;
  }
  
  useMemo() {
    if (this.memo) {
      this.display = this.memo;
    }
  }
  
  clearMemo() {
    this.memo = null;
  }
}
