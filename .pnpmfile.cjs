module.exports = {
  hooks: {
    readPackage: pkg => {
      delete pkg.optionalDependencies
      return pkg
    },
  },
}
