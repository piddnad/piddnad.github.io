[Piddnad's Blog](https://piddnad.github.io/)
==========

This repository hosts my Jekyll-based personal blog.

The theme is based on the clean, responsive Jekyll template [maupassant-jekyll](https://github.com/alafighting/maupassant-jekyll.git), with additional modifications inspired by [oukohou](https://github.com/oukohou) and the [oukohou blog theme](https://github.com/oukohou/oukohou.github.io). Thanks to the original authors.

Template preview:

![template preview](https://camo.githubusercontent.com/74fd2ccea00a682742515ce1d3725283c3385721/687474703a2f2f6f6f6f2e306f302e6f6f6f2f323031352f31302f32342f353632623562653132313737652e6a7067 "Maupassant template preview")

## Simplest macOS setup (for this project)

Run all commands from the repository root.

### 1. Check environment

Dependencies are defined in `Gemfile`. Verified working local environment:

- Ruby `2.6.10`
- Bundler `1.17.2`

Check your versions:

```bash
ruby -v
bundle -v
```

### 2. Install dependencies

```bash
bundle check || bundle install
```

### 3. Build locally

```bash
bundle exec jekyll build
```

Build output is generated in `_site/`.

### 4. Run locally

```bash
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

Open: `http://127.0.0.1:4000`

Stop server: press `Ctrl + C`.

## Local deployment test (CLI)

To quickly verify the local deployment pipeline:

```bash
bundle exec jekyll serve --host 127.0.0.1 --port 4001 --detach
curl -I http://127.0.0.1:4001
pkill -f "jekyll serve --host 127.0.0.1 --port 4001"
```

Expected response includes: `HTTP/1.1 200 OK`.

## Notes

- This repository tracks both `Gemfile` and `Gemfile.lock` for reproducible dependency resolution.
- If you add or update gems, run `bundle install` and restart `bundle exec jekyll serve`.
