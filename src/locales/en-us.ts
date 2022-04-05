export default {
  app: {
    name: 'Privacy Space',
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
      title: 'Album',
    },
    add: {
      title: 'Create Album',
      msg: 'Please Enter the Album Name',
    },
    defaultName: 'Default album',
    noData: 'No album',
  },

  search: {
    cancel: 'Cancel',
    placeholder: 'Albums, Pictures and Videos',
  },

  quickAction: {
    capture: {
      title: 'Quick shot',
      shortTitle: 'Shoot a picture',
    },
    transfer: {
      title: 'WI-FI transfer',
      shortTitle: 'WI-FI transfer',
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
    showInfo: 'View the details',
    loadingLabelText: 'Importing...',
    noData: 'No images or videos',
    save: 'Save to local',
    saving: 'Saving',
    saveStatus: {
      success: 'Saved to album',
      fail: 'Failed to save to album',
    },
    add: {
      album: 'Album',
      doc: 'Document',
      camera: 'Camera',
    },
    moveToAlbum: 'Move to album',
    deleteActionSheet: {
      all: {
        title: 'Delete all pictures and videos',
      },
      title: 'These {{content}} will be deleted',
      msg: {
        softDelete: 'Can be restored to the recycle bin',
        delete: 'This action is irreversible',
      },
    },
  },

  miniApps: {
    navigation: {
      title: 'Mini Apps',
    },
  },

  recycleBin: {
    navigation: {
      title: 'Recycle bin',
    },
    tip: 'It is kept for up to {{ duration }} days, after which it will be permanently deleted.',
    enableTip:
      'The recycle bin is turned off and can be turned on in the settings in the upper right corner.',
    restore: 'Restore to album',
  },

  recycleBinSetting: {
    navigation: {
      title: ' Recycle bin setting',
    },
    enableHeader: 'Deleted files are not recoverable after closing',
    enableTitle: 'Enable recycle bin',
    durationHeader: 'RETENTION DAYS',
    day: ' days',
  },

  setting: {
    navigation: {
      title: 'Settings',
    },
    changePass: 'Change Passcode',
    autoLockAuth: 'Automatically Open {{authType}} Unlock',
    feedback: 'Feedback',
    language: 'Language',
    grade: 'Good Reviews',
    shareApp: 'Share APP',
    haptic: 'Haptic Feedback',
    safe: 'Safe',
    help: 'Help',
    immediate: 'Immediate',
    hapticFeedback: 'Haptic feedback',
    autoClearOrigin: 'Prompt to delete original file after import',
    advanced: {
      navigation: {
        title: 'Advanced settings',
      },
      smartSearch: {
        title: 'Enable smart search',
        header: 'SMART SEARCH',
      },
    },
  },

  albumCover: {
    navigation: {
      title: 'Album cover',
    },
    tab: {
      item: 'Album item',
      system: 'System cover',
    },
  },

  urgent: {
    navigation: {
      title: 'Facedown Action',
    },
    tableViewHeader:
      'When the phone screen is facing down, it will jump to the following specified application',
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
      title: 'Setting Appearance ',
    },
    mode: 'APPEARANCE MODE',
    theme: 'COLOR THEME',
    appIcon: 'APP ICON',
    light: 'Light',
    dark: 'Dark',
  },

  langSetting: {
    navigation: {
      title: 'Setting Language',
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
    selectAll: 'Select all',
    unselectAll: 'Unselect all',
    share: 'Share',
    delete: 'Delete',
    deleteAll: 'Delete all',
    move: 'Move',
    copy: 'Copy',
    edit: 'Edit',
    restore: 'Restore',
    restoreAll: 'Restore all',
    noData: 'No data',
    all: 'All',
    enabled: 'Enabled',
    disabled: 'Disabled',
    closed: 'Closed',
    opened: 'Opened',
  },

  permission: {
    camera: 'Camera',
    microphone: 'Microphone',
    faceID: 'Face ID',
    photoLibrary: 'Photo library',
    mediaLibrary: 'Media library',
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
    reset: 'Reset password',
  },

  // 文件管理
  fileManage: {
    gallery: 'Gallery',
    list: 'List',
    ctime: 'Creation time',
    mtime: 'Modification time',
    size: 'File size',
    name: 'Name',
    info: {
      name: 'File name',
      type: 'Type',
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
      subtitle: 'Complete Privacy Space functional experience',
    },
    card: {
      title: 'Privacy Space Premium',
      desc: 'Unlock all privileges',
      button: 'Buy',
    },
    tableView: {
      title: 'Privacy Space Premium',
    },
    paying: 'Purchasing',
    price: 'Pricing',
    privilege: 'Advanced Privileges',
    purchased: 'Bought',
    subscribed: 'Subscribed',
    contact: 'contact us',
    declare:
      'The Apple Account will be charged to the user after the user confirms the purchase and pays for it. If you have any questions, please',
    rights: {
      wifi: {
        title: 'WI-FI transfer',
      },
      search: {
        title: 'Smart search',
      },
      trash: {
        title: 'Customize the Recycle Bin retention time',
      },
      more: {
        title: 'More features coming soon...',
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
      title: 'Buy - {{price}}',
    },
    restore: 'Restore',
    recovering: 'Recovering',
  },

  transfer: {
    navigation: {
      title: 'WI-FI transfer',
    },
    tip1: 'Open the following URL by entering or scanning the QR code in the browser of your computer or other device.',
    tip2: 'Must be connected to the same WI-FI, do not leave this page',
    errorTip: 'Please check the WI-FI connection',
    connectFail: 'Connection failed, please try again!',
    wifiTip: 'Please turn on WI-FI and try again',
  },

  createAlbum: {
    dialog: {
      title: 'Create an album',
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
      desc: 'Modify description',
      rename: 'Rename',
      descPlaceholder: 'Please enter a description',
    },
  },
};
