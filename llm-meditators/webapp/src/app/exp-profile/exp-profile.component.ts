/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an Apache2 license that can be
 * found in the LICENSE file and http://www.apache.org/licenses/LICENSE-2.0
==============================================================================*/

import { Component, Signal, computed } from '@angular/core';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SavedDataService } from '../services/saved-data.service';
import { User, UserProfile } from '../../lib/staged-exp/data-model';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

const dummyProfileData: UserProfile = {
  pronouns: 'They/Them',
  avatarUrl: '/assets/avatars/they.png',
  name: 'John Doe',
};

@Component({
  selector: 'app-exp-profile',
  standalone: true,
  imports: [MatRadioModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
  templateUrl: './exp-profile.component.html',
  styleUrl: './exp-profile.component.scss',
})
export class ExpProfileComponent {
  public responseControl: FormControl<string | null>;
  public profile: UserProfile;
  public error: Signal<string | null>;

  constructor(private dataService: SavedDataService) {
    this.error = computed(() => {
      const currentStage = this.dataService.user().currentStage;
      if (!currentStage) {
        return `currentStage is undefined`;
      }
      if (currentStage.kind !== 'set-profile') {
        return `currentStage is kind is not right: ${JSON.stringify(currentStage, null, 2)}`;
      }
      return null;
    });

    // Assumption: this is only ever constructed when
    // `this.dataService.data().experiment.currentStage` references a
    // ExpStageUserProfile.

    if (this.dataService.data().user.currentStage.kind !== 'set-profile') {
      this.profile = dummyProfileData;
    } else {
      this.profile = this.dataService.data().user.currentStage.config as UserProfile;
    }

    // this.stageData = computed(() => {
    //   if (this.dataService.data().user.currentStage.kind !== 'set-profile') {
    //     return dummyProfileData;
    //   }
    //   return this.dataService.data().user.currentStage.config as UserProfile;
    // });

    this.responseControl = new FormControl<string>('');
    this.responseControl.valueChanges.forEach((n) => {
      if (n) {
        this.profile.name = n;
        this.updateStageAndUser(this.profile);
      }
    });
  }

  isComplete(): boolean {
    return this.profile.avatarUrl !== '' && this.profile.name !== '' && this.profile.pronouns !== '';
  }

  updatePronouns(updatedValue: MatRadioChange) {
    this.profile.pronouns = updatedValue.value;
    this.updateStageAndUser({ ...this.profile });
  }

  updateAvatarUrl(updatedValue: MatRadioChange) {
    this.profile.avatarUrl = updatedValue.value;
    this.updateStageAndUser({ ...this.profile });
  }

  updateStageAndUser(curStageData: UserProfile) {
    this.dataService.updateExpStage(curStageData);
    this.dataService.setStageComplete(this.isComplete());
  }
}
