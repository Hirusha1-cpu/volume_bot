import { Scenes, Context } from "telegraf";

/**
 * It is possible to extend the session object that is available to each scene.
 * This can be done by extending `SceneSessionData` and in turn passing your own
 * interface as a type variable to `SceneSession` and to `SceneContextScene`.
 */
interface WalletBotSceneSession extends Scenes.SceneSessionData {
  // will be available under `ctx.scene.session.???`
}

/**
 * We can still extend the regular session object that we can use on the
 * context. However, as we're using scenes, we have to make it extend
 * `SceneSession`.
 *
 * It is possible to pass a type variable to `SceneSession` if you also want to
 * extend the scene session as we do above.
 */
interface WalletBotSession extends Scenes.SceneSession<WalletBotSceneSession> {
  // will be available under `ctx.session.???`
}

/**
 * Now that we have our session object, we can define our own context object.
 *
 * As always, if we also want to use our own session object, we have to set it
 * here under the `session` property. In addition, we now also have to set the
 * scene object under the `scene` property. As we extend the scene session, we
 * need to pass the type in as a type variable once again.
 */
export interface WalletBotContext extends Context {
  // declare session type
  session: WalletBotSession;
  // declare scene type
  scene: Scenes.SceneContextScene<WalletBotContext, WalletBotSceneSession>;

  // will be available under `ctx.???`
}
