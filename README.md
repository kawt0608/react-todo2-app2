
# TodoApp

React、TypeScript、Tailwind CSS を使用し、ローカルストレージでデータを永続化した「Todoアプリ」です。

## URL

- **https://kawt0608.github.io/react-todo2-app2/**


## アプリの機能

- このアプリは`localStorage` にタスクを保存し、更新してもデータが保持されます。
- タスクは「未完了・完了」「優先度」「期限」に基づいて自動でソートされます（未完了 → 優先度高 → 期限が早い順）。
- ダークモードとライトモードの切り替えが可能。
- 「元に戻す」操作が可能な Undo 機能を提供します。
- 画面上部に外部リンク（YouTube、Netflix）。
- 犬が隠れています。

### ソート機能

- ヘッダや一覧下部のコントロールで「優先度でソート」または「期限でソート」を選択できます。
- デフォルトは「優先度でソート」です（未完了→優先度→期限）。
- 「期限でソート」を選ぶと、未完了のタスク内で期日が早い順に並び替えられ、優先度は二次的に使われます。

使い方:

- 画面右下（または一覧の下部にある）ソートボタンで切り替えてください。クリックすると即座に並び順が変わります。

### 編集機能

- 各タスク行に「編集」ボタンがあります。編集をクリックするとその行が編集モードになり、以下が変更できます:
	- タスク名（テキスト入力）
	- 優先度（1〜3 のセレクト）
	- 期限（日時入力）
- 編集モードでは「保存」「キャンセル」ボタンが表示されます。保存すると変更が即座に反映され、`localStorage` にも保存されます。


## 技術スタック / 主要ライブラリ

このアプリで使用している主な技術やライブラリは次の通りです。

- **フレームワーク / 言語**: React（v19） + TypeScript
- **バンドラ / 開発ツール**: Vite
- **スタイリング**: Tailwind CSS
- **日付操作**: dayjs
- **ユニーク ID**: uuid
- **アイコン**: Font Awesome（`@fortawesome/react-fontawesome`）
- **ローカル永続化**: ブラウザの `localStorage` を利用（サーバー不要）

パッケージの詳細は `package.json` を参照してください。

## スクリーンショット

以下はアプリの画面イメージです。

<figure style="text-align:center">
 	<img src="img/darkmood.png" alt="ダークモード表示" style="max-width:900px;width:80%;height:auto;border:1px solid #ddd;border-radius:6px;" />
 	<figcaption>ダークモード表示</figcaption>
</figure>

<figure style="text-align:center">
 	<img src="img/rightmood.png" alt="ライトモード・レイアウト" style="max-width:700px;width:60%;height:auto;border:1px solid #ddd;border-radius:6px;" />
 	<figcaption>ライトモード表示</figcaption>
</figure>

<figure style="text-align:center">
 	<img src="img/undo.png" alt="Undo（元に戻す）表示" style="max-width:480px;width:40%;height:auto;border:1px solid #ddd;border-radius:6px;" />
 	<figcaption>削除後の Undo </figcaption>
</figure>

<figure style="text-align:center; margin-top:1.6rem;">
  <img src="img/stormdog.jpg" alt="背景画像: stormdog" style="max-width:1200px;width:85%;height:auto;border:1px solid #ddd;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,0.15);" />
  <figcaption>サイトを更新したときに 30% の確率でページ背景にこの画像が適用されます</figcaption>
</figure>

<figure style="text-align:center; margin-top:1.2rem;">
	<img src="img/sort.png" alt="ソートボタンの表示例" style="max-width:900px;width:75%;height:auto;border:1px solid #ddd;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.08);" />
	<figcaption>編集表示 — 各タスク行の「編集」ボタンによってその行がインライン編集モードになります。名前・優先度・期限を変更して「保存」で反映します。</figcaption>
</figure>

<figure style="text-align:center; margin-top:1.2rem;">
	<img src="img/hensyuu.png" alt="編集モードの表示例" style="max-width:900px;width:75%;height:auto;border:1px solid #ddd;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.08);" />
	<figcaption>ソート表示 — 「完了済みのタスクを削除」ボタンの横にある「優先度でソート」「期限でソート」ボタン。クリックで並び順が即時に切り替わります。</figcaption>
</figure>

## 挑戦・工夫・オリジナリティ

- **ローカル永続化の堅牢化**: `localStorage` に保存した配列が空 (`"[]"`) の場合でも「保存済み」とみなすようにロード処理を調整しました。日付は ISO 文字列から `Date` に戻す処理を追加し、保存と復元の整合性を保っています。
- **Undo（削除取り消し）機能**: タスク削除時に元のインデックスを保持し、画面に 5 秒間トーストを表示して復元できる仕組みを実装しました。ユーザー操作ミスの回復を重視した UX です。
- **優先度・期限ベースの自動ソート**: タスクは「未完了 → 優先度（小さい値が高）→ 期限（早い順）」で自動ソートされます。ユーザーが手動で並べ替えなくても重要なタスクが目に入りやすくなっています。
- **ダークモードの配慮**: CSS 変数を用いてダークテーマ／ライトテーマを切り替え、選択は `localStorage` に保存します。テーマに合わせて UI のコントラストを保つよう工夫しました。
- **ランダム背景（オリジナリティ）**: ページを更新したときに 30% の確率で `stormdog.jpg` が背景に適用されます。背景が濃い場合でも可読性を保つために半透明オーバーレイを重ねています。
- **入力バリデーションと UX 改善**: タスク名は 2〜32 文字でバリデーションを行い、エラー時は視覚的にフィードバックします。追加ボタンの状態制御など小さな配慮を積み重ねています。
- **技術選定の理由（抜粋）**: 開発速度と保守性を重視して `Vite` + `React` + `TypeScript`、スタイリングは `Tailwind CSS` を採用。日付処理に `dayjs`、ID 生成に `uuid` を使用しています。









## 開発履歴

- 2025年10月23日：プロジェクト開始



<!-- 開発期間・ガイダンス（以下は必ず README の末尾付近に表示されます） -->

## 開発期間

- 開発期間: 2025.11.10 ~ 2025.11.19 (約20時間)
