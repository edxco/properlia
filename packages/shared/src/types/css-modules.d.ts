declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  const content: {
    src: string;
    height: number;
    width: number;
  };
  export default content;
}
