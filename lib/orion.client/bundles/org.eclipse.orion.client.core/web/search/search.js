/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global window define */
/*browser:true*/

define(['require', 'dojo', 'orion/bootstrap', 'orion/status', 'orion/progress','orion/dialogs',
        'orion/commands', 'orion/favorites', 'orion/searchOutliner', 'orion/searchClient', 'orion/fileClient', 'orion/operationsClient', 'orion/searchResults', 'orion/globalCommands', 'orion/contentTypes', 'orion/searchUtils', 'orion/PageUtil',
        'dojo/hash', 'dojo/parser', 'dijit/layout/BorderContainer', 'dijit/layout/ContentPane'], 
		function(require, dojo, mBootstrap, mStatus, mProgress, mDialogs, mCommands, mFavorites, mSearchOutliner, 
				mSearchClient, mFileClient, mOperationsClient, mSearchResults, mGlobalCommands, mContentTypes, mSearchUtils, PageUtil) {

	dojo.addOnLoad(function() {
		function makeHref(fileClient, seg, location, searchParams, searcher){
			var searchLocation = (!location || location === "" || location === "root") ? searcher.getSearchRootLocation() : location;
			var newParams = mSearchUtils.copySearchParams(searchParams);
			newParams.resource = searchLocation;
			seg.href = mSearchUtils.generateSearchHref(newParams);
		}
	
		function setPageInfo(serviceRegistry, fileClient, commandService, searcher, searchResultsGenerator, searchParams){
			var searchLoc = searchParams.resource;
			if(searchLoc){
				if(searchLoc === fileClient.fileServiceRootURL(searchLoc)){
					searcher.setRootLocationbyURL(searchLoc);
					searcher.setLocationbyURL(searchLoc);
					mGlobalCommands.setPageTarget({task: "Search", serviceRegistry: serviceRegistry, 
						commandService: commandService, searchService: searcher, fileService: fileClient, breadcrumbRootName: fileClient.fileServiceName(searchLoc),
						makeBreadcrumbLink: function(seg,location){makeHref(fileClient, seg, location, searchParams, searcher);}});
						searcher.setChildrenLocationbyURL(searchLoc);
						searchResultsGenerator.loadResults(searchParams);
				} else {
					fileClient.read(searchLoc, true).then(
						dojo.hitch(this, function(metadata) {
							mGlobalCommands.setPageTarget({task: "Search", target: metadata, serviceRegistry: serviceRegistry, 
								fileService: fileClient, commandService: commandService, searchService: searcher, breadcrumbRootName: "Search",
								makeBreadcrumbLink: function(seg,location){makeHref(fileClient, seg, location, searchParams, searcher);}});
								searchResultsGenerator.loadResults(searchParams);
						}),
						dojo.hitch(this, function(error) {
							window.console.error("Error loading file metadata: " + error.message); //$NON-NLS-0$
						})
					);
				}
			} else {
				mGlobalCommands.setPageTarget({task: "Search", serviceRegistry: serviceRegistry, 
					commandService: commandService, searchService: searcher, fileService: fileClient, breadcrumbRootName: "Search",
					makeBreadcrumbLink: function(seg,location){makeHref(fileClient, seg, location, searchParams, searcher);}});
			}
		}
		mBootstrap.startup().then(function(core) {
			var serviceRegistry = core.serviceRegistry;
			var preferences = core.preferences;
			
			// we use internal border containers so we need dojo to parse.
			dojo.parser.parse();

			var dialogService = new mDialogs.DialogService(serviceRegistry);
			var operationsClient = new mOperationsClient.OperationsClient(serviceRegistry);
			new mStatus.StatusReportingService(serviceRegistry, operationsClient, "statusPane", "notifications", "notificationArea"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
			new mProgress.ProgressService(serviceRegistry, operationsClient);
			var commandService = new mCommands.CommandService({serviceRegistry: serviceRegistry});
			// favorites and saved searches
			new mFavorites.FavoritesService({serviceRegistry: serviceRegistry});
			new mSearchOutliner.SavedSearches({serviceRegistry: serviceRegistry});

			var fileClient = new mFileClient.FileClient(serviceRegistry);
			var contentTypeService = new mContentTypes.ContentTypeService(serviceRegistry);
			var searcher = new mSearchClient.Searcher({serviceRegistry: serviceRegistry, commandService: commandService, fileService: fileClient});
			
			var searchOutliner = new mSearchOutliner.SearchOutliner({parent: "searchProgress", serviceRegistry: serviceRegistry}); //$NON-NLS-0$
			mGlobalCommands.generateBanner("orion-searchResults", serviceRegistry, commandService, preferences, searcher, searcher, null, null); //$NON-NLS-0$
			
			var searchParams = PageUtil.matchResourceParameters();
			mSearchUtils.convertSearchParams(searchParams);
			var toolbar = dojo.byId("pageActions"); //$NON-NLS-0$
			if (toolbar) {	
				commandService.destroy(toolbar);
				commandService.renderCommands(toolbar.id, toolbar, searcher, searcher, "button"); //$NON-NLS-0$
			}
			var searchResultsGenerator = new mSearchResults.SearchResultsGenerator(serviceRegistry, "results", commandService, fileClient, searcher, false/*crawling*/); //$NON-NLS-0$
			setPageInfo(serviceRegistry, fileClient, commandService, searcher, searchResultsGenerator, searchParams);
			//searchResultsGenerator.loadResults(queryString);
			//every time the user manually changes the hash, we need to load the results with that name
			dojo.subscribe("/dojo/hashchange", searchResultsGenerator, function() { //$NON-NLS-0$
				searchParams = PageUtil.matchResourceParameters();
				mSearchUtils.convertSearchParams(searchParams);
				setPageInfo(serviceRegistry, fileClient, commandService, searcher, searchResultsGenerator, searchParams);
				//searchResultsGenerator.loadResults(query);
				var toolbar = dojo.byId("pageActions"); //$NON-NLS-0$
				if (toolbar) {	
					commandService.destroy(toolbar);
					commandService.renderCommands(toolbar.id, toolbar, searcher, searcher, "button"); //$NON-NLS-0$
				}
			});
		});
	});
});
