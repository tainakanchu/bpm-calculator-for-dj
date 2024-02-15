# BPM Calculator fro DJ

This application is a tool for DJs and music producers to calculate the tempo of beats (BPM: Beats Per Minute) in real time.

## About this app

### Main Features

- Calculate BPM in response to user taps
  - The color of the displayed BPM indicates the accuracy of the calculated BPM, with green meaning the highest accuracy.
- Display values of 1/2, 3/4, 4/3 of the calculated BPM

> [!NOTE]
> The calculation of beat taps uses a unique logic, and taps at obviously short intervals are ignored. Also, a new calculation begins after a certain time has passed from the first tap.

### How to Use

- Open the application.
- Tap the screen to the beat. Each tap calculates the BPM and displays it on the screen.

![BPM Calculator Application](./docs/images/screenshot.png)

## Development Environment

Development EnvironmentThis application is developed using [Next.js](https://nextjs.org/). To start the development server, run the following command:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
