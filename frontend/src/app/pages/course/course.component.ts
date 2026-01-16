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
  isLoading = true;

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

  /**
   * Load signs from JSON file via SignService
   * Signs are defined in: assets/data/road-signs.json
   */
  loadSigns() {
    this.isLoading = true;
    this.signService.getAllSigns().subscribe({
      next: (signs: RoadSign[]) => {
        this.signs = signs;
        this.filterSigns();
        this.isLoading = false;
      },
      error: () => {
        this.signs = [];
        this.filterSigns();
        this.isLoading = false;
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
}
