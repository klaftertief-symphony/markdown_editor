<?php

class extension_markdown_editor extends Extension {

	public function about() {
		return array(
			'name' => 'Markdown Editor',
			'version' => '0.1',
			'release-date' => '2011-07-04',
			'author' => array(
				'name' => 'Jonas Coch',
				'website' => 'http://klaftertief.de',
				'email' => 'jonas@klaftertief.de'
			),
			'description' => 'Adds a markdown editor to every markdown textarea field on every entry page.'
		);
	}

	public function getSubscribedDelegates() {
		return array(
			array(
				'page' => '/backend/',
				'delegate' => 'InitaliseAdminPageHead',
				'callback' => 'initaliseAdminPageHead'
			)
		);
	}

	public function initaliseAdminPageHead($context) {
		$page_callback = Administration::instance()->getPageCallback();
		$page_callback = $page_callback['context'];

		if(isset($page_callback['section_handle']) && ($page_callback['page'] == 'edit' || $page_callback['page'] == 'new')){
			Administration::instance()->Page->addStylesheetToHead(URL . '/extensions/markdown_editor/assets/dialog.css', 'screen', 1980);
			Administration::instance()->Page->addStylesheetToHead(URL . '/extensions/markdown_editor/assets/editor.css', 'screen', 1981);
			Administration::instance()->Page->addScriptToHead(URL . '/extensions/markdown_editor/assets/dialog.js', 1982);
			Administration::instance()->Page->addScriptToHead(URL . '/extensions/markdown_editor/assets/editor.js', 1983);
			Administration::instance()->Page->addScriptToHead(URL . '/extensions/markdown_editor/assets/markdown_editor.publish.js', 1984);
		}
	}
}
