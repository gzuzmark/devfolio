const htmlmin = require("html-minifier");

module.exports = (eleventyConfig) => {
  // Add a readable date formatter filter to Nunjucks
  eleventyConfig.addFilter("dateDisplay", require("./filters/dates.js"));

  // Add a HTML timestamp formatter filter to Nunjucks
  eleventyConfig.addFilter(
    "htmlDateDisplay",
    require("./filters/timestamp.js")
  );

  // Minify our HTML
  eleventyConfig.addTransform("htmlmin", (content, outputPath) => {
    if (outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });

  // Collections
  eleventyConfig.addCollection("blog", (collection) => {
    const blogs = collection.getFilteredByTag("blog");

    for (let i = 0; i < blogs.length; i++) {
      const prevPost = blogs[i - 1];
      const nextPost = blogs[i + 1];

      blogs[i].data["prevPost"] = prevPost;
      blogs[i].data["nextPost"] = nextPost;
    }

    return blogs.reverse();
  });

  // Layout aliases
  eleventyConfig.addLayoutAlias("default", "layouts/default.njk");
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  // Include our static assets
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("robots.txt");

  /* Markdown plugins */
  // https://www.11ty.dev/docs/languages/markdown/
  // --and-- https://github.com/11ty/eleventy-base-blog/blob/master/.eleventy.js
  // --and-- https://github.com/planetoftheweb/seven/blob/master/.eleventy.js
  let markdownIt = require("markdown-it");
  let markdownItFootnote = require("markdown-it-footnote");
  let markdownItPrism = require("markdown-it-prism");
  let markdownItAttrs = require("markdown-it-attrs");
  let markdownItBrakSpans = require("markdown-it-bracketed-spans");
  let markdownItLinkAttrs = require("markdown-it-link-attributes");
  let markdownItOpts = {
    html: true,
    linkify: false,
    typographer: true,
  };
  const markdownEngine = markdownIt(markdownItOpts);
  markdownEngine.use(markdownItFootnote);
  markdownEngine.use(markdownItPrism);
  markdownEngine.use(markdownItAttrs);
  markdownEngine.use(markdownItBrakSpans);
  markdownEngine.use(markdownItLinkAttrs, {
    pattern: /^https:/,
    attrs: {
      target: "_blank",
      rel: "noreferrer noopener",
    },
  });
  eleventyConfig.setLibrary("md", markdownEngine);

  return {
    templateFormats: ["html", "md", "njk", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    passthroughFileCopy: true,

    dir: {
      input: "site",
      output: "dist",
      includes: "includes",
      data: "globals",
    },
  };
};
