# Video Speed Controller

Simple Chrome extension for changing video playback speed on the current page.

The extension adds a popup with speed buttons from `0.25x` to `16x`.

It also detects the Netflix ad countdown popup, speeds the video up to `16x`, and then automatically returns playback speed back to `1x`.

## Features

- Change video speed on the current active tab
- Supports multiple playback speeds
- Highlights the currently selected speed
- Works with standard HTML `<video>` elements
- Detects Netflix ad countdown popup
- Speeds Netflix ads up to `16x`
- Automatically returns speed back to `1x`

## Available Speeds

```text
0.25x
0.5x
1x
1.5x
2x
2.5x
3x
4x
5x
16x
```

## Installation

1. Download or clone this project.

2. Open Chrome or any Chromium-based browser.

3. Go to the extensions page:

```text
chrome://extensions/
```

4. Enable **Developer mode** in the top-right corner.

5. Click **Load unpacked**.

6. Select the project folder.

7. Make sure the selected folder contains these files:

```text
manifest.json
popup.html
popup.css
popup.js
assets/
```

8. The extension should now appear in your browser toolbar as **Video Speed Controller**.

## Usage

1. Open any page with a video.

2. Click the extension icon in the browser toolbar.

3. Choose the playback speed you want.

4. The speed will be applied to videos on the current page.

## Netflix Ad Speed Handling

When the extension detects a Netflix ad countdown popup, it reads the remaining ad time and sets the video speed to `16x`.

Instead of waiting for the countdown to reach `1` second, it divides the detected ad time by `16` and schedules the speed to return back to `1x`.

For example:

```text
Ad countdown: 16 seconds
Speed: 16x
Reset delay: 1 second
```

Another example:

```text
Ad countdown: 32 seconds
Speed: 16x
Reset delay: 2 seconds
```

## Required Permissions

The extension uses these Chrome permissions:

```json
"permissions": ["scripting", "activeTab"]
```

## Notes

This extension only works on pages that use standard HTML `<video>` elements.

Some websites may block or override custom playback speed changes.

Netflix ad handling depends on the current Netflix ad popup structure. If Netflix changes its HTML, the detection logic may need to be updated.
