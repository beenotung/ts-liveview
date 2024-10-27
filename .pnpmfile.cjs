module.exports = {
  hooks: {
    readPackage: pkg => {
      // need to install optional dependencies, e.g. @esbuild/linux-x64 for esbuild
      // delete pkg.optionalDependencies
      return pkg
    },
  },
}
