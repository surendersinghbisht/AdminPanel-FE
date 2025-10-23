import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEmailTemplate } from './manage-email-template';

describe('ManageEmailTemplate', () => {
  let component: ManageEmailTemplate;
  let fixture: ComponentFixture<ManageEmailTemplate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageEmailTemplate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageEmailTemplate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
