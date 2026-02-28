// Type declarations for importing plain CSS/SASS files (global and modules)
// Prevents TypeScript errors like "Cannot find module or type declarations for side-effect import of './globals.css'"

declare module "*.css";
declare module "*.scss";
declare module "*.sass";

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.sass" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
