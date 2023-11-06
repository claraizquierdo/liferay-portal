/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

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
import TimeSpanSelector, {TimeSpanOption} from '../TimeSpanSelector';
import TotalCount from '../TotalCount';
import {TrafficSource} from './types';

const SOCIAL_MEDIA_COLORS = {
	facebook: '#4B9BFF',
	instagram: '#FFB46E',
	linkedin: '#7785FF',
	others: '#6B6C7E',
	pinterest: '#50D2A0',
	snapchat: '#FFD76E',
	tiktok: '#FF73C3',
	twitter: '#5FC8FF',
	youtube: '#FF5F5F',
} as const;
const DEFAULT_LANGUAGE_TAG = 'en-US';

interface Props {
	currentPage: {
		data: {
			referringSocialMedia: Array<{
				name: keyof typeof SOCIAL_MEDIA_COLORS;
				title: string;
				trafficAmount: number;
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

export default function SocialDetail({
	currentPage,
	handleDetailPeriodChange,
	timeSpanOptions,
	trafficShareDataProvider,
	trafficSourcesDataProvider,
	trafficVolumeDataProvider,
}: Props) {
	const {languageTag} = useContext(StoreStateContext);

	const {referringSocialMedia} = currentPage.data;

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

	const keyToHexColor = (name: keyof typeof SOCIAL_MEDIA_COLORS) => {
		return SOCIAL_MEDIA_COLORS[name] ?? '#666666';
	};

	const keyToWidth = (index: number) => {
		if (index === 0) {
			return '100%';
		}

		return `${
			(referringSocialMedia[index].trafficAmount * 100) /
			referringSocialMedia[0].trafficAmount
		}%`;
	};

	const [highlighted, setHighlighted] = useState<string | null>(null);

	const firstUpdateRef = useRef(true);

	const trafficSourceDetailClasses = className(
		'c-p-3 traffic-source-detail',
		{
			'traffic-source-detail--loading': pieChartLoading,
		}
	);

	function handleLegendMouseEnter(name: string) {
		setHighlighted(name);
	}

	function handleLegendMouseLeave() {
		setHighlighted(null);
	}

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
					handleDetailPeriodChange(trafficSources, 'social', true);
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
								{Liferay.Language.get(
									'top-referring-social-media'
								)}
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
					{referringSocialMedia.map(
						({name, title, trafficAmount}, index) => {
							const listItemClasses = className({
								dim: highlighted && name !== highlighted,
							});

							return (
								<ClayList.Item
									className={listItemClasses}
									flex
									key={title}
									onMouseOut={handleLegendMouseLeave}
									onMouseOver={() =>
										handleLegendMouseEnter(name)
									}
								>
									<ClayList.ItemField style={{width: '70px'}}>
										<ClayList.ItemText>
											<span className="c-mr-2 text-secondary">
												{title}
											</span>
										</ClayList.ItemText>
									</ClayList.ItemField>

									<ClayList.ItemField
										className="align-self-center"
										expand
									>
										<div
											style={{
												backgroundColor: keyToHexColor(
													name
												),
												height: '16px',
												width: keyToWidth(index),
											}}
										/>
									</ClayList.ItemField>

									<ClayList.ItemField className="align-self-center">
										<span className="align-self-end c-ml-2 font-weight-semi-bold text-dark">
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
						}
					)}
				</>
			</ClayList>
		</div>
	);
}
