import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface QuizQuestion {
  id: number;
  question: string;
  imageUrl?: string;
  answers: { text: string; correct: boolean }[];
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {
  questions: QuizQuestion[] = [];
  currentQuestionIndex = 0;
  selectedAnswerIndex: number | null = null;
  showResult = false;
  isCorrect = false;
  score = 0;
  quizStarted = false;
  quizFinished = false;

  ngOnInit() {
    this.loadQuestions();
  }

  get currentQuestion(): QuizQuestion {
    return this.questions[this.currentQuestionIndex];
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  loadQuestions() {
    this.questions = [
      {
        id: 1,
        question: 'Co oznacza znak B-1 (czerwone kolo z bialym srodkiem)?',
        answers: [
          { text: 'Zakaz ruchu w obu kierunkach', correct: true },
          { text: 'Zakaz wjazdu', correct: false },
          { text: 'Zakaz zatrzymywania', correct: false },
          { text: 'Droga dla pieszych', correct: false }
        ]
      },
      {
        id: 2,
        question: 'Trojkatny znak z czerwona obwodka i symbolem krowy oznacza:',
        answers: [
          { text: 'Gospodarstwo rolne w poblizu', correct: false },
          { text: 'Zwierzeta gospodarskie moga pojawic sie na drodze', correct: true },
          { text: 'Zakaz wjazdu dla zwierzat', correct: false },
          { text: 'Ferma zwierzat', correct: false }
        ]
      },
      {
        id: 3,
        question: 'Niebieski okragly znak z biala strzalka w prawo oznacza:',
        answers: [
          { text: 'Zalecany kierunek jazdy', correct: false },
          { text: 'Nakaz jazdy w prawo', correct: true },
          { text: 'Informacja o skrecie', correct: false },
          { text: 'Parking po prawej stronie', correct: false }
        ]
      },
      {
        id: 4,
        question: 'Znak "STOP" wymaga:',
        answers: [
          { text: 'Zmniejszenia predkosci', correct: false },
          { text: 'Zatrzymania pojazdu', correct: true },
          { text: 'Ustapienia pierwszenstwa bez zatrzymywania', correct: false },
          { text: 'Zwiekszenia ostroznosci', correct: false }
        ]
      },
      {
        id: 5,
        question: 'Znak z przekreslonym telefonem oznacza:',
        answers: [
          { text: 'Telefon awaryjny w poblizu', correct: false },
          { text: 'Brak zasiegu sieci', correct: false },
          { text: 'Zakaz uzywania telefonow', correct: true },
          { text: 'Koniec strefy WiFi', correct: false }
        ]
      }
    ];
  }

  startQuiz() {
    this.quizStarted = true;
    this.quizFinished = false;
    this.score = 0;
    this.currentQuestionIndex = 0;
    this.selectedAnswerIndex = null;
    this.showResult = false;
  }

  selectAnswer(index: number) {
    if (this.showResult) return;

    this.selectedAnswerIndex = index;
    this.showResult = true;
    this.isCorrect = this.currentQuestion.answers[index].correct;

    if (this.isCorrect) {
      this.score++;
    }
  }

  nextQuestion() {
    if (this.isLastQuestion) {
      this.quizFinished = true;
      this.quizStarted = false;
    } else {
      this.currentQuestionIndex++;
      this.selectedAnswerIndex = null;
      this.showResult = false;
    }
  }

  restartQuiz() {
    this.startQuiz();
  }

  getLetterForIndex(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getScoreMessage(): string {
    const percentage = (this.score / this.questions.length) * 100;

    if (percentage === 100) return 'Perfekcyjnie! Jestes ekspertem od znakow drogowych!';
    if (percentage >= 80) return 'Swietny wynik! Znasz znaki bardzo dobrze!';
    if (percentage >= 60) return 'Dobra robota! Jeszcze troche nauki i bedziesz mistrzem!';
    if (percentage >= 40) return 'Nie poddawaj sie! Wroc do kursu i sprobuj ponownie!';
    return 'Czas na nauke! Przejrzyj kurs i wroc do quizu!';
  }
}
