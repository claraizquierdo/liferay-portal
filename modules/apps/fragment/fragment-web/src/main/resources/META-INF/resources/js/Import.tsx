/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayForm, {ClayCheckbox} from '@clayui/form';
import ClayLayout from '@clayui/layout';
import ClayToolbar from '@clayui/toolbar';
import classNames from 'classnames';
import {fetch, navigate, openToast, sub} from 'frontend-js-web';
import React, {useRef, useState} from 'react';

import ImportResults, {ImportResultsData} from './ImportResults';

interface Props {
	backURL: string;
	importURL: string;
	portletNamespace: string;
}

const VALID_EXTENSIONS = '.zip';

function Import({backURL, importURL, portletNamespace}: Props) {
	const [error, setError] = useState<string | null>(null);
	const [overwrite, setOverwrite] = useState<boolean>(true);
	const [file, setFile] = useState<File | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [
		importResults,
		setImportResults,
	] = useState<ImportResultsData | null>(null);

    const inputFileRef = useRef() as React.MutableRefObject<HTMLInputElement>;

	const validateFile = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files || event.target.files?.length === 0) {
			setFile(null);
			setFileName(null);

			return;
		}

		setFile(event.target.files[0]);

		const fileName: string = event.target.files[0]?.name || '';

		setFileName(fileName);

		const fileExtension = fileName
			.substring(fileName.lastIndexOf('.') + 1)
			.toLowerCase();

		if (fileExtension === 'zip') {
			setError(null);
		}
		else {
			setError(Liferay.Language.get('only-zip-files-are-allowed'));
		}
	};

	const goBack = () => {
		navigate(backURL);
	};

	const importOtherFile = () => {
		setImportResults(null);
	};

	const importFile = () => {
		const formData = new FormData();

		if (!file) {
			return;
		}

		formData.append(`${portletNamespace}file`, file);
		formData.append(`${portletNamespace}overwrite`, overwrite.toString());

		fetch(importURL, {
			body: formData,
			method: 'POST',
		})
			.then((response) => response.json())
			.then(({importResults}) => {
				if (
					!importResults ||
					(!importResults.imported &&
						!importResults['imported-draft'] &&
						!importResults.invalid)
				) {
					navigate(backURL);
					openToast({
						message: sub(
							Liferay.Language.get(
								'something-went-wrong-and-the-x-could-not-be-imported'
							),
							fileName || ''
						),
						type: 'danger',
					});
				}
				setImportResults(importResults);
				setFile(null);
			})
			.catch(() => {
				openToast({
					message: sub(
						Liferay.Language.get(
							'something-went-wrong-and-the-x-could-not-be-imported'
						),
						fileName || ''
					),
					type: 'danger',
				});
			});
	};

	return (
		<>
			<ClayToolbar light>
				<ClayLayout.ContainerFluid>
					<ClayToolbar.Nav className="justify-content-sm-end">
						{importResults ? (
							<>
								<ClayToolbar.Item>
									<ClayButton
										displayType="secondary"
										onClick={importOtherFile}
										size="sm"
									>
										{Liferay.Language.get(
											'upload-another-file'
										)}
									</ClayButton>
								</ClayToolbar.Item>

								<ClayToolbar.Item>
									<ClayButton onClick={goBack} size="sm">
										{Liferay.Language.get('done')}
									</ClayButton>
								</ClayToolbar.Item>
							</>
						) : (
							<>
								<ClayToolbar.Item>
									<ClayButton
										displayType="secondary"
										onClick={goBack}
										size="sm"
									>
										{Liferay.Language.get('cancel')}
									</ClayButton>
								</ClayToolbar.Item>

								<ClayToolbar.Item>
									<ClayButton
										disabled={!!error || !file}
										onClick={importFile}
										size="sm"
									>
										{Liferay.Language.get('import')}
									</ClayButton>
								</ClayToolbar.Item>
							</>
						)}
					</ClayToolbar.Nav>
				</ClayLayout.ContainerFluid>
			</ClayToolbar>

			<ClayLayout.ContainerFluid view>
				{importResults ? (
					<ImportResults
						fileName={fileName}
						importResults={importResults}
					/>
				) : (
					<ClayLayout.Sheet size="lg">
						<h2 className="c-mb-4 text-6">
							{Liferay.Language.get('import-file')}
						</h2>

						<p>
							{Liferay.Language.get(
								'select-a-zip-file-containing-one-or-multiple-entries'
							)}
						</p>

						<ClayForm.Group
							className={classNames({'has-error': error})}
						>
							<label className="c-mb-2 d-block" htmlFor={`${portletNamespace}file`}>
								{Liferay.Language.get('file-upload')}
							</label>

							<input
								accept={VALID_EXTENSIONS}
								data-testid={`${portletNamespace}file`}
								hidden
                                id={`${portletNamespace}file`}
								multiple
								name="file"
								onChange={validateFile}
								ref={inputFileRef}
                                type="file"
							/>

							<ClayButton.Group spaced>
								<ClayButton
									displayType="secondary"
									onClick={() => {
										inputFileRef.current.click();
									}}
									size="sm"
								>
									{file
										? Liferay.Language.get('replace-files')
										: Liferay.Language.get('select-files')}
								</ClayButton>
							</ClayButton.Group>

							{error && (
								<ClayForm.FeedbackGroup>
									<ClayForm.FeedbackItem>
										<ClayForm.FeedbackIndicator symbol="exclamation-full" />

										{error}
									</ClayForm.FeedbackItem>
								</ClayForm.FeedbackGroup>
							)}
						</ClayForm.Group>

						<ClayCheckbox
							checked={overwrite}
							data-testid={`${portletNamespace}overwrite`}
							label={Liferay.Language.get(
								'overwrite-existing-entries'
							)}
							onChange={() => setOverwrite((val) => !val)}
						/>

                        <p className="c-mt-3 text-3 text-weight-semi-bold">{fileName}</p>
					</ClayLayout.Sheet>
				)}
			</ClayLayout.ContainerFluid>
		</>
	);
}

export default Import;
