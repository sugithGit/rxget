export default function BreakingChangesPage() {
  return (
    <>
      <h1>Breaking Changes</h1>
      <p>
        If you are coming from GetX v4 or v5, here are the key changes in rxget 2.0+.
      </p>

      <h2>Rx Types</h2>
      <table>
        <thead>
          <tr>
            <th>Before</th>
            <th>After</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>StringX</td>
            <td><code>RxString</code></td>
          </tr>
           <tr>
            <td>IntX</td>
            <td><code>RxInt</code></td>
          </tr>
           <tr>
            <td>MapX</td>
            <td><code>RxMap</code></td>
          </tr>
           <tr>
            <td>ListX</td>
            <td><code>RxList</code></td>
          </tr>
        </tbody>
      </table>

      <h2>Controller Merging</h2>
      <p>
        <code>RxController</code> and <code>GetBuilder</code> logic are merged. Just use <code>GetxController</code> for everything.
      </p>

      <h2>Removed Features</h2>
      <ul>
        <li>No Navigation/Routing (Get.to, Get.off, etc.)</li>
        <li>No Snackbars/Dialogs helpers (Get.snackbar, Get.dialog)</li>
        <li>No Utils (GetUtils)</li>
      </ul>
    </>
  );
}
