// Copyright 2017 Telefónica Digital España S.L.
//
// PROJECT: urbo-telefonica
//
// This software and / or computer program has been developed by
// Telefónica Digital España S.L. (hereinafter Telefónica Digital) and is protected as
// copyright by the applicable legislation on intellectual property.
//
// It belongs to Telefónica Digital, and / or its licensors, the exclusive rights of
// reproduction, distribution, public communication and transformation, and any economic
// right on it, all without prejudice of the moral rights of the authors mentioned above.
// It is expressly forbidden to decompile, disassemble, reverse engineer, sublicense or
// otherwise transmit by any means, translate or create derivative works of the software and
// / or computer programs, and perform with respect to all or part of such programs, any
// type of exploitation.
//
// Any use of all or part of the software and / or computer program will require the
// express written consent of Telefónica Digital. In all cases, it will be necessary to make
// an express reference to Telefónica Digital ownership in the software and / or computer
// program.
//
// Non-fulfillment of the provisions set forth herein and, in general, any violation of
// the peaceful possession and ownership of these rights will be prosecuted by the means
// provided in both Spanish and international law. Telefónica Digital reserves any civil or
// criminal actions it may exercise to protect its rights.

var deps = {};

var src = 'src/verticals/traffic/';
var srcJS = src + 'js/';
var public = 'verticals/traffic/';

deps.templateFolder = [srcJS + 'template'];

deps.JS = [
  srcJS + 'Namespace.js',
  srcJS + 'Metadata.js',
  srcJS + 'Collection/Traffic.js',
  srcJS + 'View/Filter/Traffic/HeatMapFilter.js',
  srcJS + 'View/Map/Traffic/HeatMapView.js',
  srcJS + 'View/Map/Traffic/BikesCurrentView.js',
  srcJS + 'View/Map/Traffic/BikesEvolutionMapView.js',
  srcJS + 'View/Map/Traffic/Layer/HeatMapLayer.js',
  srcJS + 'View/Panels/Traffic/TrafficMasterPanelView.js',
  srcJS + 'View/Panels/Traffic/TrafficCurrentPanelView.js',
  srcJS + 'View/Panels/Traffic/TrafficHistoricPanelView.js',
  srcJS + 'View/Panels/Traffic/TrafficBikesAnalysisPanelView.js',
  srcJS + 'View/Panels/Traffic/TrafficBikesCurrentPanelView.js',
  srcJS + 'View/widgets/Traffic/CongestedRoadsStacked.js',
  srcJS + 'View/widgets/Traffic/RoadTrafficRanking.js',
  srcJS + 'View/widgets/Traffic/TrafficIntensityValues.js',
  srcJS + 'View/widgets/Traffic/WidgetAvailableBikesRatePie.js',
  srcJS + 'View/widgets/Traffic/WidgetBikesRanking.js',
  srcJS + 'View/widgets/Traffic/WidgetBikeStations.js',
  srcJS + 'View/widgets/Traffic/WidgetHourlyBikesAvailability.js',
  srcJS + 'View/widgets/Traffic/WidgetFreeOccupancyRateEvolution.js',
  srcJS + 'View/widgets/Traffic/WidgetOccupancyRatePerHour.js',
];

deps.lessFile = [ src + 'css/styles.less' ];

deps.extraResources = [
  { srcFolder: src + 'public/img', dstFolder: public + 'img', onDebugIgnore: false },
  { srcFolder: src + 'public/mapstyle', dstFolder: public + 'mapstyle', onDebugIgnore: false }
]

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
