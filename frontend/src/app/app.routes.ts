import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CourseComponent } from './pages/course/course.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { AuthComponent } from './pages/auth/auth.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'course', component: CourseComponent },
  { path: 'quiz', component: QuizComponent },
  { path: '**', redirectTo: '' }
];
