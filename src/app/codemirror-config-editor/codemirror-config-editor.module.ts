/* Copyright 2023 Google LLC. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import { NgModule } from '@angular/core';
import { CodemirrorConfigEditorComponent } from './codemirror-config-editor.component';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [CodemirrorConfigEditorComponent],
  imports: [MatButtonModule, CommonModule, MatIconModule, MatMenuModule],
  exports: [CodemirrorConfigEditorComponent],
})
export class CodemirrorConfigEditorModule {}
