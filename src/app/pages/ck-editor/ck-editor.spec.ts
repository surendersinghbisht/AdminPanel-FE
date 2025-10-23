import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CkEditor } from './ck-editor';

describe('CkEditor', () => {
  let component: CkEditor;
  let fixture: ComponentFixture<CkEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CkEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CkEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
