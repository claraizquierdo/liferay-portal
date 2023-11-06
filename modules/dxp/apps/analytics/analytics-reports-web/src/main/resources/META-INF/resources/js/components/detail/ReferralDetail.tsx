/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayList from '@clayui/list';
import ClayLoadingIndicator from '@clayui/loading-indicator';
import className from 'classnames';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';

import {
	ChartDispatchContext,
	ChartStateContext,
	useDateTitle,
	useIsPreviousPeriodButtonDisabled,
} from '../../context/ChartStateContext';
import ConnectionContext from '../../context/ConnectionContext';
import {
	StoreDispatchContext,
	StoreStateContext,
} from '../../context/StoreContext';
import {generateDateFormatters as dateFormat} from '../../utils/dateFormat';
import {numberFormat} from '../../utils/numberFormat';
import Hint from '../Hint';
import TimeSpanSelector, {TimeSpanOption} from '../TimeSpanSelector';
import TotalCount from '../TotalCount';
import {TrafficSource} from './types';

const ITEMS_TO_SHOW = 5;
const DEFAULT_LANGUAGE_TAG = 'en-US';
interface Props {
	currentPage: {
		data: {
			referringDomains: Array<{
				trafficAmount: number;
				url: string;
			}>;
			referringPages: Array<{
				trafficAmount: number;
				url: string;
			}>;
			title: string;
		};
		view: string;
	};
	handleDetailPeriodChange: (
		trafficSources: Array<TrafficSource>,
		trafficSourceName: string,
		sameTrafficSource: boolean
	) => void;
	timeSpanOptions: Array<TimeSpanOption>;
	trafficShareDataProvider: () => Promise<string>;
	trafficSourcesDataProvider: () => Promise<Array<TrafficSource>>;
	trafficVolumeDataProvider: () => Promise<string>;
}

export default function ReferralDetail({
	currentPage,
	handleDetailPeriodChange,
	timeSpanOptions,
	trafficShareDataProvider,
	trafficSourcesDataProvider,
	trafficVolumeDataProvider,
}: Props) {
	const {languageTag} = useContext(StoreStateContext);

	const [isReferringPagesExpanded, setIsReferringPagesExpanded] = useState(
		false
	);

	const [
		isReferringDomainsExpanded,
		setIsReferringDomainsExpanded,
	] = useState(false);

	const {referringDomains, referringPages} = currentPage.data;

	const dateFormatters = useMemo(
		() => dateFormat(languageTag ? languageTag : DEFAULT_LANGUAGE_TAG),
		[languageTag]
	);

	const {firstDate, lastDate} = useDateTitle();

	const title = useMemo(() => {
		if (firstDate && lastDate) {
			return dateFormatters.formatChartTitle([firstDate, lastDate]);
		}
		else {
			return '';
		}
	}, [dateFormatters, firstDate, lastDate]);

	const dispatch = useContext(StoreDispatchContext);

	const chartDispatch = useContext(ChartDispatchContext);

	const {pieChartLoading, timeSpanKey, timeSpanOffset} = useContext(
		ChartStateContext
	);

	const {validAnalyticsConnection} = useContext(ConnectionContext);

	const isPreviousPeriodButtonDisabled = useIsPreviousPeriodButtonDisabled();

	const firstUpdateRef = useRef(true);

	const trafficSourceDetailClasses = className(
		'c-p-3 traffic-source-detail',
		{
			'traffic-source-detail--loading': pieChartLoading,
		}
	);

	const referingPagesToShow = referringPages.slice(
		0,
		isReferringPagesExpanded ? 10 : ITEMS_TO_SHOW
	);

	useEffect(() => {
		if (firstUpdateRef.current) {
			firstUpdateRef.current = false;

			return;
		}

		if (validAnalyticsConnection) {
			chartDispatch({
				payload: {
					loading: true,
				},
				type: 'SET_PIE_CHART_LOADING',
			});

			trafficSourcesDataProvider()
				.then((trafficSources) => {
					handleDetailPeriodChange(trafficSources, 'referral', true);
				})
				.catch(() => {
					dispatch({type: 'ADD_WARNING'});
				})
				.finally(() => {
					chartDispatch({
						payload: {
							loading: false,
						},
						type: 'SET_PIE_CHART_LOADING',
					});
				});
		}
	}, [
		chartDispatch,
		dispatch,
		handleDetailPeriodChange,
		timeSpanKey,
		timeSpanOffset,
		trafficSourcesDataProvider,
		validAnalyticsConnection,
	]);

	return (
		<div className={trafficSourceDetailClasses}>
			{pieChartLoading && (
				<ClayLoadingIndicator
					className="chart-loading-indicator"
					size="sm"
				/>
			)}

			<div className="c-mb-3 c-mt-2">
				<TimeSpanSelector
					disabledNextTimeSpan={timeSpanOffset === 0}
					disabledPreviousPeriodButton={
						isPreviousPeriodButtonDisabled
					}
					timeSpanKey={timeSpanKey}
					timeSpanOptions={timeSpanOptions}
				/>
			</div>

			{title && <h5 className="c-mb-4">{title}</h5>}

			<TotalCount
				className="c-mb-2"
				dataProvider={trafficVolumeDataProvider}
				label={Liferay.Language.get('traffic-volume')}
				popoverHeader={Liferay.Language.get('traffic-volume')}
				popoverMessage={Liferay.Language.get(
					'traffic-volume-is-the-number-of-page-views-coming-from-one-channel'
				)}
				popoverPosition="bottom"
			/>

			<TotalCount
				className="c-mb-3"
				dataProvider={trafficShareDataProvider}
				label={Liferay.Language.get('traffic-share')}
				percentage={true}
				popoverHeader={Liferay.Language.get('traffic-share')}
				popoverMessage={Liferay.Language.get(
					'traffic-share-is-the-percentage-of-traffic-sent-to-your-page-by-one-channel'
				)}
			/>

			<ClayList className="list-group-pages-list">
				<ClayList.Item flex>
					<ClayList.ItemField expand>
						<ClayList.ItemTitle className="text-truncate-inline">
							<span className="text-truncate">
								{Liferay.Language.get('top-referring-pages')}

								<span className="text-secondary">
									<Hint
										message={Liferay.Language.get(
											'top-referring-pages-help'
										)}
										title={Liferay.Language.get(
											'top-referring-pages'
										)}
									/>
								</span>
							</span>
						</ClayList.ItemTitle>
					</ClayList.ItemField>

					<ClayList.ItemField>
						<ClayList.ItemTitle>
							<span>{Liferay.Language.get('traffic')}</span>
						</ClayList.ItemTitle>
					</ClayList.ItemField>
				</ClayList.Item>

				<>
					{referingPagesToShow.map(({trafficAmount, url}) => (
						<ClayList.Item flex key={url}>
							<ClayList.ItemField expand>
								<ClayList.ItemText>
									<span
										className="text-truncate-inline"
										data-tooltip-align="top"
										title={url}
									>
										<a
											className="c-mr-2 text-primary text-truncate text-truncate-reverse"
											href={url}
											target="_blank"
										>
											{url}
										</a>
									</span>
								</ClayList.ItemText>
							</ClayList.ItemField>

							<ClayList.ItemField expand>
								<span className="align-self-end font-weight-semi-bold text-dark">
									{numberFormat(
										languageTag
											? languageTag
											: DEFAULT_LANGUAGE_TAG,
										trafficAmount
									)}
								</span>
							</ClayList.ItemField>
						</ClayList.Item>
					))}
				</>
			</ClayList>

			{referringPages.length > 5 && (
				<ClayButton
					borderless
					className="c-mb-4"
					displayType="secondary"
					onClick={() =>
						setIsReferringPagesExpanded(!isReferringPagesExpanded)
					}
					size="sm"
				>
					{isReferringPagesExpanded ? (
						<span>{Liferay.Language.get('view-less')}</span>
					) : (
						<span>{Liferay.Language.get('view-more')}</span>
					)}
				</ClayButton>
			)}

			<ClayList className="list-group-pages-list">
				<ClayList.Item flex>
					<ClayList.ItemField expand>
						<ClayList.ItemTitle className="text-truncate-inline">
							<span className="text-truncate">
								{Liferay.Language.get('top-referring-domains')}

								<span className="text-secondary">
									<Hint
										message={Liferay.Language.get(
											'top-referring-domains-help'
										)}
										title={Liferay.Language.get(
											'top-referring-domains'
										)}
									/>
								</span>
							</span>
						</ClayList.ItemTitle>
					</ClayList.ItemField>

					<ClayList.ItemField>
						<ClayList.ItemTitle>
							<span>{Liferay.Language.get('traffic')}</span>
						</ClayList.ItemTitle>
					</ClayList.ItemField>
				</ClayList.Item>
				<>
					{referringDomains
						.slice(
							0,
							isReferringDomainsExpanded ? 10 : ITEMS_TO_SHOW
						)
						.map(({trafficAmount, url}) => {
							return (
								<ClayList.Item flex key={url}>
									<ClayList.ItemField expand>
										<ClayList.ItemText>
											<span
												className="text-truncate-inline"
												data-tooltip-align="top"
												title={url}
											>
												<a
													className="c-mr-2 text-primary text-truncate"
													href={url}
													target="_blank"
												>
													{url}
												</a>
											</span>
										</ClayList.ItemText>
									</ClayList.ItemField>

									<ClayList.ItemField expand>
										<span className="align-self-end font-weight-semi-bold text-dark">
											{numberFormat(
												languageTag
													? languageTag
													: DEFAULT_LANGUAGE_TAG,
												trafficAmount
											)}
										</span>
									</ClayList.ItemField>
								</ClayList.Item>
							);
						})}
				</>
			</ClayList>

			{referringDomains.length > 5 && (
				<ClayButton
					borderless
					className="c-mb-4"
					displayType="secondary"
					onClick={() =>
						setIsReferringDomainsExpanded(
							!isReferringDomainsExpanded
						)
					}
					size="sm"
				>
					{isReferringDomainsExpanded ? (
						<span>{Liferay.Language.get('view-less')}</span>
					) : (
						<span>{Liferay.Language.get('view-more')}</span>
					)}
				</ClayButton>
			)}
		</div>
	);
}
