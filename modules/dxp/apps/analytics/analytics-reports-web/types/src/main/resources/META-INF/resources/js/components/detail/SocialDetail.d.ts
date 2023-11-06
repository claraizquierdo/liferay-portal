/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/// <reference types="react" />

import {TimeSpanOption} from '../TimeSpanSelector';
import {TrafficSource} from './types';
declare const SOCIAL_MEDIA_COLORS: {
	readonly facebook: '#4B9BFF';
	readonly instagram: '#FFB46E';
	readonly linkedin: '#7785FF';
	readonly others: '#6B6C7E';
	readonly pinterest: '#50D2A0';
	readonly snapchat: '#FFD76E';
	readonly tiktok: '#FF73C3';
	readonly twitter: '#5FC8FF';
	readonly youtube: '#FF5F5F';
};
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
}: Props): JSX.Element;
export {};
