import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCms } from './add-cms';

describe('AddCms', () => {
  let component: AddCms;
  let fixture: ComponentFixture<AddCms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
