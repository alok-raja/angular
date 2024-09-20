/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ImportManager} from '@angular/compiler-cli/src/ngtsc/translator';
import assert from 'assert';
import ts from 'typescript';
import {ProgramInfo, projectFile, Replacement, TextUpdate} from '../../../../utils/tsurge';
import {convertToSignalInput} from '../convert-input/convert_to_signal';
import {KnownInputs} from '../input_detection/known_inputs';
import {MigrationHost} from '../migration_host';
import {MigrationResult} from '../result';
import {insertTodoForIncompatibility} from '../utils/incompatibility_todos';

/**
 * Phase that migrates `@Input()` declarations to signal inputs and
 * manages imports within the given file.
 */
export function pass6__migrateInputDeclarations(
  host: MigrationHost,
  checker: ts.TypeChecker,
  result: MigrationResult,
  knownInputs: KnownInputs,
  importManager: ImportManager,
  info: ProgramInfo,
) {
  let filesWithMigratedInputs = new Set<ts.SourceFile>();
  let filesWithIncompatibleInputs = new WeakSet<ts.SourceFile>();

  for (const [input, metadata] of result.sourceInputs) {
    const sf = input.node.getSourceFile();
    const inputInfo = knownInputs.get(input)!;

    // Do not migrate incompatible inputs.
    if (inputInfo.isIncompatible()) {
      // Add a TODO for the incompatible input, if desired.
      if (host.config.insertTodosForSkippedFields) {
        result.replacements.push(...insertTodoForIncompatibility(input.node, info, inputInfo));
      }

      filesWithIncompatibleInputs.add(sf);
      continue;
    }

    assert(metadata !== null, `Expected metadata to exist for input isn't marked incompatible.`);
    assert(!ts.isAccessor(input.node), 'Accessor inputs are incompatible.');

    filesWithMigratedInputs.add(sf);
    result.replacements.push(
      new Replacement(
        projectFile(sf, info),
        new TextUpdate({
          position: input.node.getStart(),
          end: input.node.getEnd(),
          toInsert: convertToSignalInput(input.node, metadata, checker, importManager, result),
        }),
      ),
    );
  }

  for (const file of filesWithMigratedInputs) {
    // All inputs were migrated, so we can safely remove the `Input` symbol.
    if (!filesWithIncompatibleInputs.has(file)) {
      importManager.removeImport(file, 'Input', '@angular/core');
    }
  }
}
