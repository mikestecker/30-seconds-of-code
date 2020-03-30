import create404Page from './create404Page';
import createStaticPage from './createStaticPage';
import createSettingsPage from './createSettingsPage';
import createListingPages from './createListingPages';
import createSearchPage from './createSearchPage';
import createSnippetPages from './createSnippetPages';
import { transformSnippetIndex } from 'functions/transformers';
import { parseListingMetas } from 'functions/parsers';
import literals from 'lang/en';

/**
 * Tell plugins to add pages.
 * Takes a query string and a templates object.
 * Takes a list of requirable objects after being loaded.
 * Creates pages by running individual methods.
 */
const createPages = (query, templates, requirables) => ({ graphql, actions }) => {
  const { createPage } = actions;

  return graphql(query)
    .then(result => {
      if (result.errors) throw result.errors;

      const searchIndex = result.data.searchIndex;
      const commonContext = {
        logoSrc: result.data.logoSrc.childImageSharp.original.src,
        splashLogoSrc: result.data.splashLogoSrc.childImageSharp.original.src,
        snippetCount: searchIndex.edges.length,
      };

      const listingMetas = parseListingMetas(requirables);

      create404Page(
        templates['NotFoundPage'],
        createPage,
        {
          ...commonContext,
        }
      );

      createStaticPage(
        templates['StaticPage'],
        createPage,
        {
          ...commonContext,
          stringLiterals: literals.about,
        },
        '/about'
      );

      createStaticPage(
        templates['StaticPage'],
        createPage,
        {
          ...commonContext,
          stringLiterals: literals.cookies,
        },
        '/cookies'
      );

      createSettingsPage(
        templates['SettingsPage'],
        createPage,
        {
          ...commonContext,
          stringLiterals: literals.settings,
        }
      );

      createListingPages(
        searchIndex,
        listingMetas,
        templates['ListingPage'],
        createPage,
        {
          ...commonContext,
        },
        '/list'
      );

      const allSnippets = [
        ...result.data.simpleSnippets.edges,
        ...result.data.cssSnippets.edges,
        ...result.data.blogSnippets.edges,
      ];

      createSnippetPages(
        result.data.simpleSnippets.edges,
        templates['SnippetPage'],
        createPage,
        {
          ...commonContext,
          cardTemplate: 'standard',
        },
        allSnippets
      );

      createSnippetPages(
        result.data.cssSnippets.edges,
        templates['SnippetPage'],
        createPage,
        {
          ...commonContext,
          cardTemplate: 'css',
        },
        allSnippets
      );

      createSnippetPages(
        result.data.blogSnippets.edges,
        templates['SnippetPage'],
        createPage,
        {
          ...commonContext,
          cardTemplate: 'blog',
        },
        allSnippets,
        result.data.images.edges
      );

      createSearchPage(
        templates['SearchPage'],
        createPage,
        {
          ...commonContext,
          searchIndex: transformSnippetIndex(searchIndex.edges),
          pageDescription: literals.search.pageDescription(searchIndex.edges.length),
        },
        '/search_index'
      );

      createSearchPage(
        templates['SearchPage'],
        createPage,
        {
          ...commonContext,
          recommendedSnippets: transformSnippetIndex(searchIndex.edges.slice(0, 3)),
          pageDescription: literals.search.pageDescription(searchIndex.edges.length),
        }
      );

      return null;
    });
};

export default createPages;