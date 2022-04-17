export default {
  app: {
    name: 'PSpace',
  },

  faceID: {
    msg: 'For unlocking',
  },

  thirdPartyApp: {
    browser: 'Safari',
    email: 'Mail',
    note: 'Notes',
    qq: 'QQ',
    wechat: 'WeChat',
    weixin: 'WeChat',
    douyin: 'TikTok',
    kwai: 'Kwai',
    tikTok: 'TikTok',
    bilibili: 'Bilibili',
    album: 'Photos',
    facebook: 'Facebook',
    twitter: 'Twitter',
    instagram: 'Instagram',
  },

  album: {
    navigation: {
      title: 'Albums',
    },
    add: {
      title: 'Create Album',
      msg: 'Please Enter the Album Name',
    },
    defaultName: 'Default album',
    noData: 'No albums',
  },

  search: {
    cancel: 'Cancel',
    placeholder: 'Albums, Pictures and Videos',
  },

  quickAction: {
    capture: {
      title: 'Quick Take',
      shortTitle: 'Take',
    },
    transfer: {
      title: 'WI-FI Transfer',
      shortTitle: 'Transfer',
    },
  },

  imageList: {
    navigation: {
      selectBtn: 'Select',
      subtitle: {
        image: '{{count}} photos',
        video: '{{count}} videos',
      },
    },
    tapHereToChange: 'Choose another album',
    showInfo: 'Get Info',
    loadingLabelText: 'Importing...',
    noData: 'No Images or Videos',
    save: 'Save to local',
    saving: 'Saving',
    imported: 'Imported',
    saveStatus: {
      success: 'Saved to local',
      fail: 'Failed to save to local',
    },
    add: {
      album: 'Albums',
      doc: 'Documents',
      camera: 'Camera',
    },
    moveToAlbum: 'Move to Album',
    deleteActionSheet: {
      all: {
        title: 'Delete all pictures and videos',
      },
      title: 'These {{content}} will be deleted',
      msg: {
        softDelete: 'Can be recovered to the recycle bin',
        delete: 'This action is irreversible',
      },
    },
  },

  fileManager: {
    navigation: {
      title: 'Files',
    },
    bottomTab: {},
    add: {
      scan: 'Scan documents',
      doc: 'Import file',
      folder: 'New folder',
      notSupported: {
        msg: 'The current device does not support this feature',
      },
    },
    folderForm: {
      title: 'New folder',
      msg: 'Please enter a new folder name',
    },
    save: 'Save to local',
    deleteActionSheet: {
      title: 'These {{count}} files will be deleted',
    },
    noData: 'No files',
    items: 'items',
    move: {
      text: 'Move',
    },
    copy: {
      text: 'Copy',
    },
  },

  miniApps: {
    navigation: {
      title: 'Mini Apps',
    },
  },

  recycleBin: {
    navigation: {
      title: 'Recycle Bin',
    },
    tip: 'It is kept for up to {{ duration }} days, after which it will be permanently deleted.',
    enableTip:
      'The recycle bin is turned off and can be turned on in the settings in the upper right corner.',
    restore: 'Recover to Album',
  },

  recycleBinSetting: {
    navigation: {
      title: ' Recycle Bin Setting',
    },
    enableHeader: 'Deleted files are not recoverable after closing',
    enableTitle: 'Enable Recycle Bin',
    durationHeader: 'RETENTION DAYS',
    day: ' days',
  },

  setting: {
    navigation: {
      title: 'Settings',
    },
    changePass: 'Change Passcode',
    autoLockAuth: 'Automatically Enable {{authType}} Unlock',
    localAuth: 'Enable {{authType}} to Unlock',
    feedback: 'Help & Feedback',
    language: 'Language',
    grade: 'Good Reviews',
    shareApp: 'Share APP',
    haptic: 'Haptic Feedback',
    safe: 'Safe',
    help: 'Help',
    immediate: 'Immediate',
    hapticFeedback: 'Haptic Feedback',
    autoClearOrigin: 'Prompt to delete original file after import',
    advanced: {
      navigation: {
        title: 'Advanced',
      },
      smartSearch: {
        title: 'Enable Smart Search',
        header: 'SMART SEARCH',
      },
    },
  },

  albumCover: {
    navigation: {
      title: 'Album Cover',
    },
    tab: {
      item: 'Album Items',
      system: 'System Covers',
    },
  },

  urgent: {
    navigation: {
      title: 'Facedown Action',
    },
    tableViewHeader:
      'When the phone screen is facing down, it will jump to the following specified application',
    uninstall: 'The app is not installed',
    openFail: 'Unable to open the app',
  },

  autoLock: {
    navigation: {
      title: 'Auto-Lock',
    },
    immediate: 'Immediate',
    tableViewHeader:
      'After switching to another APP, it will be automatically locked after the time interval selected below is exceeded',
  },

  appearance: {
    navigation: {
      title: 'Appearance',
    },
    mode: 'APPEARANCE MODE',
    theme: 'COLOR THEME',
    appIcon: 'APP ICON',
    light: 'Light',
    dark: 'Dark',
  },

  langSetting: {
    navigation: {
      title: 'Language',
    },
  },

  fakePass: {
    navigation: {
      title: 'Fake Passcode',
    },
    enable: 'Enable',
    header:
      'When enabled, the automatic {{localAuthText}} recognition unlock function will be disabled',
    hideAuthBtn: 'Hide the unlock interface {{localAuthText}} unlock button',
  },

  albumSetting: {
    navigation: {
      title: 'Setting Album',
    },
    albumName: 'Album name',
    placeholder: 'Please enter album name',
    cover: 'Album cover',
    deleteActionSheet: {
      title: 'Delete album',
    },
  },

  about: {
    navigation: {
      title: 'About',
    },
    changelog: 'Changelog',
    private: 'Privacy Policy',
    agreement: 'User Agreement',
    moreApps: 'More Apps',
    connect: 'CONTACT US',
    QQgroup: 'QQ group',
    email: 'Email',
  },

  browser: {
    navigation: {
      title: 'Browser',
    },
  },

  common: {
    emptyDataText: 'Empty',
    cancel: 'Cancel',
    confirm: 'Confirm',
    open: 'Open',
    close: 'Close',
    done: 'Done',
    language: 'Language',
    day: 'day',
    hour: 'hour',
    minute: 'minute',
    second: 'second',
    help: 'Help',
    followSystem: 'Follow System',
    auto: 'Auto',
    faceID: 'Face ID',
    touchID: 'Touch ID',
    create: 'Create',
    change: 'Change',
    modify: 'Modify',
    reset: 'Reset',
    select: 'Select',
    selectAll: 'Select All',
    unselectAll: 'Unselect All',
    share: 'Share',
    delete: 'Delete',
    deleteAll: 'Delete All',
    move: 'Move',
    copy: 'Copy',
    edit: 'Edit',
    restore: 'Recover',
    restoreAll: 'Recover All',
    noData: 'No Data',
    all: 'All',
    enabled: 'Enabled',
    disabled: 'Disabled',
    closed: 'Closed',
    opened: 'Opened',
    rename: 'Rename',
  },

  permission: {
    camera: 'Camera',
    microphone: 'Microphone',
    faceID: 'Face ID',
    photoLibrary: 'Photo Library',
    mediaLibrary: 'Media Library',
    motion: 'Motion',
    unavailable: '{{permission}} unavailable',
    blocked:
      'Please go to settings to grant {{permissions}} permission to use this function normally',
  },

  passcodeLock: {
    create: 'Creat {{type}} Passcode',
    change: 'Change {{type}} Passcode',
    confirm: 'Confirm {{type}} Passcode',
    verify: 'Enter Passcode',
    createErr: 'Failed to Create Password',
    fake: 'Fake',
    reset: 'Reset Password',
  },

  // 文件管理
  fileManage: {
    gallery: 'Gallery',
    list: 'List',
    icons: 'Icons',
    ctime: 'Created',
    mtime: 'Modified',
    size: 'Size',
    name: 'Name',
    kind: 'Kind',
    info: {
      name: 'File Name',
      type: 'Kind',
      dime: 'Dimensions',
      duration: 'Duration',
      desc: 'Description',
    },
    file: {
      type: {
        image: 'Image',
        video: 'Video',
        album: 'Album',
      },
    },
  },

  purchase: {
    navigation: {
      title: 'Premium',
      subtitle: 'Complete PSpace functional experience',
    },
    card: {
      title: 'PSpace Premium',
      desc: 'Unlock all features',
      button: 'Buy',
    },
    tableView: {
      title: 'PSpace Premium',
    },
    paying: 'Purchasing',
    price: 'Pricing',
    privilege: 'Features',
    purchased: 'Bought',
    subscribed: 'Subscribed',
    contact: 'contact us',
    declare:
      'The Apple Account will be charged to the user after the user confirms the purchase and pays for it. If you have any questions, please',
    rights: {
      wifi: {
        title: 'WI-FI Transfer',
      },
      search: {
        title: 'Smart Search',
      },
      trash: {
        title: 'Customize the Recycle Bin retention time',
      },
      more: {
        title: 'More features coming soon...',
      },
      scan: {
        title: 'Scan Documents',
      },
    },
    unpayTip: 'Only available after purchase',
    purchaseState: {
      fail: {
        title: 'Failed purchase',
        canceled: 'Your purchase has been cancelled',
        deferred:
          'You are not authorized to purchase, ask for parental approval',
        errorCode: 'error code: ',
      },
      restoreFail: {
        title: 'Failed to restore purchases',
        detail: 'No purchase record, please buy',
      },
    },
    product: {
      title: 'Permanent member',
      subTitle: 'One-time payment, unlock all features permanently',
    },
    payButton: {
      title: '{{price}} Purchase lifetime',
    },
    restore: 'Restore',
    recovering: 'Restoring',
  },

  transfer: {
    navigation: {
      title: 'WI-FI Transfer',
    },
    tip1: 'Open the following URL by entering or scanning the QR code in the browser of your computer or other device.',
    tip2: 'Must be connected to the same WI-FI, do not leave this page',
    errorTip: 'Please check the WI-FI connection',
    connectFail: 'Connection failed, please try again!',
    wifiTip: 'Please turn on WI-FI and try again',
  },

  createAlbum: {
    dialog: {
      title: 'Create an Album',
      subtitle: 'Please enter album name',
      albumName: 'Album name',
    },
    existAlert: {
      title: 'The album name already exists, please re-enter',
      msg: 'Album names cannot be the same',
    },
  },

  photoView: {
    toolbar: {
      detail: 'Detail',
      more: 'More',
      desc: 'Modify Description',
      rename: 'Rename',
      descPlaceholder: 'Please enter a description',
    },
  },

  appUpdate: {
    alert: {
      title: 'New Version {{version}}',
      ok: 'Update',
      cancel: 'Cancel',
    },
    card: {
      alert: {
        title: 'Update Tips',
        msg: 'The installation package has been downloaded, restart the APP to update',
        ok: 'Update',
      },
      title: 'New Version',
    },
  },

  shareExtension: {
    close: 'Close',
    add: 'Add',
    addStatus: {
      success: 'Added to the default album',
      fail: 'Add failed! ',
    },
    tip: 'Add {{count}} images or videos to the default album',
  },
};
