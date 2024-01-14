# 🎨 Get Palette

A simple JS library to get the dominant color  or color palette of an image just by its URL.

---

<div align="center">
    <a href="https://github.com/BlankParticle/get-palette/stargazers">
        <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/BlankParticle/get-palette?style=for-the-badge"/>
    </a>
    <a href="https://github.com/BlankParticle/get-palette/graphs/contributors">
        <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/BlankParticle/get-palette?style=for-the-badge"/>
    </a>
    <a href="https://github.com/BlankParticle/get-palette/blob/main/LICENSE">
        <img alt="License" src="https://img.shields.io/github/license/BlankParticle/get-palette?style=for-the-badge"/>
    </a>
    <a href="https://www.npmjs.com/package/get-palette">
        <img alt="Npm Downloads" src="https://img.shields.io/npm/dm/get-palette?style=for-the-badge">
    </a>
    <a href="https://github.com/BlankParticle/get-palette/actions/workflows/release.yml">
        <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/BlankParticle/get-palette/release.yml?style=for-the-badge"/>
    </a>
    <a href="https://github.com/sponsors/BlankParticle">
        <img alt="GitHub Sponsors" src="https://img.shields.io/github/sponsors/BlankParticle?style=for-the-badge"/>
    </a>
</div>

## ❄️ Installation

First install the package using a package manager of your choice.

```bash
# using npm
npm install get-palette
# or pnpm
pnpm install get-palette
# or bun
bun add get-palette
```

## 🚀 Usage

```js
import { getPalette, getColor } from "get-palette";

 // it will return an array of [r,g,b] values
const palette = await getPalette("https://source.unsplash.com/random?size=1920x1080");

// it will return a single dominant [r,g,b] value
const color = await getColor("https://source.unsplash.com/random?size=1920x1080");
```

## 🛠️ Configuration

### `getPalette(url, colorCount, quality)`

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | `string`/`URL` | - | The URL of the image |
| `colorCount` | `number` | `10` | The number of colors to be returned |
| `quality` | `number` | `10` | Sampling quality of the image |

### `getColor(url, quality)`

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | `string`/`URL` | - | The URL of the image |
| `quality` | `number` | `10` | Sampling quality of the image |

## 🏗️ How to contribute

### 🐛 Reporting Bugs

If you encounter any bugs, please report them in the [Issues](https://github.com/BlankParticle/get-palette/issues).

### 🎋 Adding new features

You need to first [fork](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#about-forking) this repository and then [clone](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#cloning-a-fork) it to your local machine.

```bash
git clone https://github.com/<your-username>/get-palette
cd get-palette
```

Now you need to create a new branch for your changes. For features, you may want to use `feat/<feature-name>` as the branch name.

```bash
git checkout -b feat/<feature-name>
```

Now you can make your changes. After you are done, you need to commit your changes.

```bash
git add .
git commit -m "feat: ✨ My Awesome feature"
```

We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages.

Now you need to push the changes to your forked repository.

```bash
git push origin feat/<feature-name>
```

Now you need to create a [Pull Request](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#making-a-pull-request) to the original repository. And you are done!

We will review your changes and merge them if everything looks good.

### 💸 Sponsorship

If you find this package useful, please consider [sponsoring me](https://github.com/sponsors/BlankParticle). This will help me spend more time on these projects.

## 📝 Credits

This Project is a modernized version of [Color Thief](https://github.com/lokesh/color-thief).

Also it's dependencies like [quantize](https://github.com/lokesh/quantize) and [get-pixels](https://github.com/scijs/get-pixels) has been also ported to modern JS syntax.

## 📜 License

This project is licensed under the [MIT License](https://github.com/BlankParticle/get-palette/blob/main/LICENSE).
