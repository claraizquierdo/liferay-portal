/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/// <reference types="react" />

import {TimeSpanOption} from '../TimeSpanSelector';
import {TrafficSource} from './types';
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
}: Props): JSX.Element;
export {};
