import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignService, RoadSign } from '../../services/sign.service';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent implements OnInit {
  private signService = inject(SignService);

  signs: RoadSign[] = [];
  filteredSigns: RoadSign[] = [];
  selectedCategory = 'ALL';
  selectedSign: RoadSign | null = null;

  categories = [
    { value: 'ALL', label: 'Wszystkie' },
    { value: 'WARNING', label: 'Ostrzegawcze' },
    { value: 'PROHIBITION', label: 'Zakazu' },
    { value: 'MANDATORY', label: 'Nakazu' },
    { value: 'INFORMATION', label: 'Informacyjne' },
    { value: 'PRIORITY', label: 'Pierwszenstwa' }
  ];

  ngOnInit() {
    this.loadSigns();
  }

  loadSigns() {
    this.signService.getAllSigns().subscribe({
      next: (signs: RoadSign[]) => {
        this.signs = signs;
        this.filterSigns();
      },
      error: () => {
        this.signs = this.getSampleSigns();
        this.filterSigns();
      }
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filterSigns();
  }

  filterSigns() {
    if (this.selectedCategory === 'ALL') {
      this.filteredSigns = this.signs;
    } else {
      this.filteredSigns = this.signs.filter(s => s.category === this.selectedCategory);
    }
  }

  selectSign(sign: RoadSign) {
    this.selectedSign = sign;
  }

  closeDetail() {
    this.selectedSign = null;
  }

  private getSampleSigns(): RoadSign[] {
    return [
      { id: 1, code: 'A-1', name: 'Niebezpieczny zakret w prawo', description: 'Ostrzega o niebezpiecznym zakrecie w prawo', category: 'WARNING', imageUrl: '/assets/signs/a-1.png', kidFriendlyDescription: 'Uwaga! Droga skreca w prawo. Kierowca musi jechac wolniej.' },
      { id: 2, code: 'A-7', name: 'Ustap pierwszenstwa', description: 'Nakaz ustapienia pierwszenstwa przejazdu', category: 'PRIORITY', imageUrl: '/assets/signs/a-7.png', kidFriendlyDescription: 'Musisz przepuscic inne samochody, ktore jada glowna droga.' },
      { id: 3, code: 'B-1', name: 'Zakaz ruchu', description: 'Zakaz ruchu w obu kierunkach', category: 'PROHIBITION', imageUrl: '/assets/signs/b-1.png', kidFriendlyDescription: 'Stop! Tedy nie wolno jechac zadnym pojazdom.' },
      { id: 4, code: 'B-2', name: 'Zakaz wjazdu', description: 'Zakaz wjazdu pojazdow', category: 'PROHIBITION', imageUrl: '/assets/signs/b-2.png', kidFriendlyDescription: 'Nie wolno tu wjezdzac! Znak dla kierowcow jadacych w te strone.' },
      { id: 5, code: 'C-1', name: 'Nakaz jazdy w prawo', description: 'Nakaz jazdy w prawo przed znakiem', category: 'MANDATORY', imageUrl: '/assets/signs/c-1.png', kidFriendlyDescription: 'Musisz skrecic w prawo przed tym znakiem.' },
      { id: 6, code: 'D-1', name: 'Droga z pierwszenstwem', description: 'Informuje o drodze z pierwszenstwem przejazdu', category: 'INFORMATION', imageUrl: '/assets/signs/d-1.png', kidFriendlyDescription: 'Jedziesz glowna droga - masz pierwszenstwo!' }
    ];
  }
}
