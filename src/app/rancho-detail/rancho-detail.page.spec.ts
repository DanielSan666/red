import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RanchoDetailPage } from './rancho-detail.page';

describe('RanchoDetailPage', () => {
  let component: RanchoDetailPage;
  let fixture: ComponentFixture<RanchoDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RanchoDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
