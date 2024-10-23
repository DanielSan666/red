import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsModalPage } from './terms-modal.page';

describe('TermsModalPage', () => {
  let component: TermsModalPage;
  let fixture: ComponentFixture<TermsModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
