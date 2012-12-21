/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global define orion */

define(["dojo", "orion/assert", "orion/searchUtils"], function(dojo, assert, mSearchUtils) {

	/**
	 * Generate a dummy search model node on a file.
	 */
	function makeFileModel() {
		var node = {type: "file", name: "test"};
		return node;
	}
	
	/**
	 * Search in a file with key word and return the file model node.
	 */
	function searchInFile(fileContentText, keyword, replacing) {
		var searchHelper = mSearchUtils.generateSearchHelper({
			resource: "Temp",
			sort: "Path asc",
			rows: 40,
			start: 0,
			keyword: keyword
		});
		var fileModel = makeFileModel();
		mSearchUtils.searchWithinFile(searchHelper.inFileQuery, fileModel, fileContentText, "\n", replacing);
		return {m: fileModel, q:searchHelper.inFileQuery};
	}
	
	/**
	 * Search in a file with key word and replace the file wiht replace string.
	 */
	function replaceFile(fileContentText, fileModel, inFileQuery, replaceString) {
		var newContents = [];
		mSearchUtils.generateNewContents(fileModel.contents,/*fileContentText.split("\n"),*/ newContents, fileModel, replaceString, inFileQuery.searchStrLength); 
		return newContents.join("\n");
	}
	
	
	var tests = {};
	/**
	 * Test replacing one key word for a one line file.
	 */
	tests.testOneKeyWord = function() {
		var searchResult = searchInFile("bar foo bar\n", "foo", true);
		var replaced = replaceFile("bar foo bar\n", searchResult.m , searchResult.q, "coo");
		assert.equal(replaced,"bar coo bar\n");
	};

	/**
	 * Test replacing one key word for a one line file.
	 */
	tests.testOneKeyWordRegEx = function() {
		var searchResult = searchInFile("bar foolish bar\n", "fo*sh", true);
		var replaced = replaceFile("bar foolish bar\n", searchResult.m , searchResult.q, "coo");
		assert.equal(replaced,"bar coo bar\n");
	};

	/**
	 * Test replacing two key words for a one line file.
	 */
	tests.testTwoKeyWords = function() {
		var searchResult = searchInFile("bar foo bar foo\n", "foo", true);
		var replaced = replaceFile("bar foo bar foo\n", searchResult.m , searchResult.q, "coo");
		assert.equal(replaced,"bar coo bar coo\n");
	};

	/**
	 * Test replacing two key words for a one line file.
	 */
	tests.testTwoKeyWordsRegEx = function() {
		var searchResult = searchInFile("bar foolish bar foolish\n", "fo???sh", true);
		var replaced = replaceFile("bar foolish bar foolish\n", searchResult.m , searchResult.q, "coo");
		assert.equal(replaced,"bar coo bar coo\n");
	};

	/**
	 * Test replacing 4 key words for a 3 line file.
	 */
	tests.testFourKeyWords = function() {
		var searchResult = searchInFile("bar foo bar foo\nbar bar foo\nfoo bar bar\n", "foo", true);
		var replaced = replaceFile("bar foo bar foo\nbar bar foo\nfoo bar bar\n", searchResult.m , searchResult.q, "coo");
		assert.equal(replaced,"bar coo bar coo\nbar bar coo\ncoo bar bar\n");
	};

	/**
	 * Test replacing 4 key words for a 3 line file.
	 */
	tests.testFourKeyWordsRegEx = function() {
		var searchResult = searchInFile("bar foolish bar foolish\nbar bar foolish\nfoolish bar bar\n", "fo*sh", true);
		var replaced = replaceFile("bar foolish bar foolish\nbar bar foolish\nfoolish bar bar\n", searchResult.m , searchResult.q, "coo");
		assert.equal(replaced,"bar coo\nbar bar coo\ncoo bar bar\n");
	};

	/**
	 * Test replacing 3 key words out of 6, for a 5 line file.
	 * The first line has 3 key words , second line with one , third with one , fourth with no key words and fifth with one
	 * We will replace the middle "foo" in the first line, third line and fifth line. 
	 */
	tests.testSixKeyWordsFiltered = function() {
		var originalFile = "bar foo bar foo bar foo\n" + 
						   "foo bar bar\n" + 
						   "bar foo bar\n" + 
						   "bar bar bar\n" + 
						   "bar bar foo\n"; 
		var expectedReplacedFile = "bar foo bar coo bar foo\n" + 
						   "foo bar bar\n" + 
						   "bar coo bar\n" + 
						   "bar bar bar\n" + 
						   "bar bar coo\n"; 
		var searchResult = searchInFile(originalFile, "foo", true);
		searchResult.m.children[0].checked = false;
		searchResult.m.children[2].checked = false;
		searchResult.m.children[3].checked = false;
		
		var replaced = replaceFile(originalFile, searchResult.m , searchResult.q, "coo");
		assert.equal(replaced,expectedReplacedFile);
	};

	return tests;
});
