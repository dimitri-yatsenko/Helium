import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { AbstractFormControl } from './abstract-form-control';

/**
 * This component provides autocomplete functionality for a dynamic form. The
 * provided FormControlSpec must have a non-undefined `autocompleteValues`.
 */
@Component({
    selector: 'autocomplete-control',
    template: `
        <div [formGroup]="group">
            <mat-form-field>
                <input matInput
                       [type]="spec.subtype"
                       [matAutocomplete]="auto"
                       [placeholder]="spec.placeholder"
                       [formControlName]="spec.formControlName"
                       [required]="spec.required">
            </mat-form-field>
            
            <mat-autocomplete #auto="matAutocomplete">
                <mat-option *ngFor="let option of currentSuggestions | async" [value]="option">
                    {{ option }}
                </mat-option>
            </mat-autocomplete>
        </div>
    `
})
export class AutocompleteControlComponent extends AbstractFormControl implements OnInit {
    public currentSuggestions: Observable<string[]>;

    public ngOnInit(): void {
        const formControl = this.group.get(this.spec.formControlName);

        if (formControl === null)
            throw new Error(`Form control with name ${this.spec.formControlName} does not exist`);

        // Start with an empty string so suggestions pop up before the user has
        // to type anything
        const userInput = formControl.valueChanges
            .startWith("");

        const autocompleteValues = this.spec.autocompleteValues!!
            // Convert all potential values to their string representations
            .map((values: any[]): string[] => values.map((it) => it.toString()));

        this.currentSuggestions = Observable.combineLatest(userInput, autocompleteValues)
            // Call filterValues with the userInput and the autocompleteValues
            .map((params: [string, string[]]) =>
                AutocompleteControlComponent.filterValues.apply(null, params));
    }

    private static filterValues(userInput: string, availableOptions: string[]): string[] {
        // Case-insensitive search
        const lowercaseOptions = availableOptions.map((val) => val.toLowerCase());
        const userInputLower = (userInput || '').toLowerCase();

        // Only return values that start with the user input
        return lowercaseOptions.filter((s) => s.indexOf(userInputLower) === 0);
    }
}
