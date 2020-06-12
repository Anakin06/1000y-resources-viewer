function checkFile(regexp: RegExp, file?: string | string[]) {
  if (!file) return false;
  if (Array.isArray(file)) {
    file = file[0];
  }
  return regexp.test(file.toLowerCase());
}

export function isMapfile(file?: string | string[]): file is string {
  return checkFile(/.map$/, file);
}

export function isAudioPkg(file?: string | string[]): file is string {
  return checkFile(/.atw$/, file);
}

export function isATZPkg(file?: string | string[]): file is string[] {
  return checkFile(/.atz$/, file);
}

export function isEFTPkg(file?: string | string[]): file is string[] {
  return checkFile(/.eft$/, file);
}
