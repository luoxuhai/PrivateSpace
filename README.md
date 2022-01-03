## Available Scripts

In the project directory, you can run:

### `yarn ios`

运行到 IOS 模拟器

### `yarn ios:release:hot`

发布热更新

```bash
  yarn ios:release:hot -t "xxx" -d Production --des "xxx"
```

| Range Expression | Who gets the update                                                                    |
| ---------------- | -------------------------------------------------------------------------------------- |
| `1.2.3`          | Only devices running the specific binary version `1.2.3` of your app                   |
| `*`              | Any device configured to consume updates from your CodePush app                        |
| `1.2.x`          | Devices running major version 1, minor version 2 and any patch version of your app     |
| `1.2.3 - 1.2.7`  | Devices running any binary version between `1.2.3` (inclusive) and `1.2.7` (inclusive) |
| `>=1.2.3 <1.2.7` | Devices running any binary version between `1.2.3` (inclusive) and `1.2.7` (exclusive) |
| `1.2`            | Equivalent to `>=1.2.0 <1.3.0`                                                         |
| `~1.2.3`         | Equivalent to `>=1.2.3 <1.3.0`                                                         |
| `^1.2.3`         | Equivalent to `>=1.2.3 <2.0.0`                                                         |

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).
To learn ReactNative, check out the [ReactNative documentation](https://reactnative.dev/).
