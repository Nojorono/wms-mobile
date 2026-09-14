# Changelog

All notable changes to this project will be documented in this file.

The format is based on **Keep a Changelog** and this project adheres to **Semantic Versioning (SemVer)**.

---

## [Unreleased]

---

## [2.0.0] - 2026-09-10

### Added

* Helper cannot open detail updateinventory - (10 Sep 2026)
* Inbound ga mandatory upload foto - (10 Sep 2026)
* Menu split and merge dibuka di helper - (9 Sep 2026)
* Subdist bisa make internal, vendor, & eksternal - (9 Sep 2026)
* Tambah label subwarehouse di movelocation - (9 Sep 2026)
* Add label subwarehouse on forklift - (9 Sep 2026)
* Subdist === eksternal - (8 Sep 2026)
* Labeling di picking - (1 Sep 2026)
* Filter rejecter - (28 Aug 2026)
* Hide retur - (21 Aug 2026)
* Helper sortir - (11 Aug 2026)
* Inspection Retur - (10 Aug 2026)
* Helper menu - (10 Aug 2026)
* Initial inbound retur - (7 Aug 2026)
* Add completed filter - (6 Aug 2026)
* Add % in text - (30 Jul 2026)
* Add filter inspection - (30 Jul 2026)
* Pallet is booking or not di create - (28 Jul 2026)
* Add capacity on create update inventory - (27 Jul 2026)
* Reject Inspection - (24 Jul 2026)
* Tambahin tampilan week - (23 Jul 2026)
* Scan di forklift - (23 Jul 2026)
* Vendor bisa integrasi juga dan subdist tidak integrasi - (22 Jul 2026)
* Changelog - (20 Jul 2026)
* Add text gate status
* Filter menu helper
* Confirmation gate
* Filtering data integration
* Selisih on goodreceive
* Attribute14
* Approval gate, vehicle info and new Inspection
* Add service for gateActivity
* Assigned gate vehicle (initial)
* Add home button on movement, outbound, and inbound
* Goodreceive plan-inspection
* Confirmation for integration
* Preview on approval gate
* Reject on Gate approval
* Add `vendor_po_number`

### Changed

* Kalo belom completed gabisa add vehicle - (9 Sep 2026)
* Penjagaan pallet memo_id gabisa tapi ga jadi - (9 Sep 2026)
* Update Pallet Rejected - (26 Aug 2026)
* Update name screen retur - (10 Aug 2026)
* Harus sama week dan uom - (28 Jul 2026)
* Kalo statusnya pending gabisa dipencet di approval - (24 Jul 2026)
* Rename list in update inventory - (24 Jul 2026)
* Update item yang statusnya OPEN - (22 Jul 2026)
* Inspection hanya bisa update qty dan kunci plan by transaction_picking.quantity - (22 Jul 2026)
* Change SELISIH to GOOD-RK-1
* Rename project wmsnna
* Update checking pallet picking outbound
* Update movement
* Update vehicle gate
* Integrated not show
* Update filter by orgId
* Update get warehouse saat selisih
* Assigned gate update username
* Update using username fill name on loading
* Update get device into username
* Change user form device
* API ganti status outbound
* Update Assign dan Good receive
* Scan move to bottom
* Styling on scanner
* Integration logic, data filtering, and new mapping for status integration
* Handle approve after upload photos

### Fixed

* Loading Dialog - (9 Sep 2026)
* Kuduus item uom disabled - (28 Aug 2026)
* KUDUS wording dan button inspecntion - (28 Aug 2026)
* Rejected pallet path - (26 Aug 2026)
* Pak aji nemu code === code - (20 Aug 2026)
* Handle deleted button features - (20 Aug 2026)
* Handle double Click - (20 Aug 2026)
* Payload data fixing - (31 Jul 2026)
* Movelocation pallet button disabled - (31 Jul 2026)
* Add status_do - (30 Jul 2026)
* Filter move location approved - (30 Jul 2026)
* Handle cancel sj - (30 Jul 2026)
* Tambahin kondisi agar button tidak keluar - (28 Jul 2026)
* Disabled button tidak jadi - (28 Jul 2026)
* Item dan week harus sama kalo mau pallet pick = sumber (PREELOAD) - (24 Jul 2026)
* Handle 1 id uom week dan bin di updateInventoryCreate - (24 Jul 2026)
* Cari kalo ada salah satu yang ready bisa dipake - (23 Jul 2026)
* Handle double click on movement - (23 Jul 2026)
* Pallet sumber kalo sama picking gaperlu check capacity - (23 Jul 2026)
* Validate pallet yg memo_id is null - (22 Jul 2026)
* Data yang di cancelled tidak boleh ada - (22 Jul 2026)
* Add status unloading agar bisa di delete activitynya - (22 Jul 2026)
* Item bisa keluar yg statusnya != open - (21 Jul 2026)
* Delete button keluar saat integrasi ulang - (21 Jul 2026)
* Logic button on inspection - (21 Jul 2026)
* Message error by BE - (21 Jul 2026)
* If !Ready and current_quantity != 0 === true - (20 Jul 2026)
* `status_inventory === ready` baru bisa dipake
* Validate Bug qtyping
* Header helper movement
* Multiple click on helper picking
* Data not showed up
* Doubleclick in Approval Gate, good receive, and picking
* Doubleclick button disabled after click
* INSPECTION disabled
* Logic button on inspection memo
* Format date outboundcard
* Delete picking pallet
* Helper submit handle
* Forklift check BIN Capacity
* Menu error and hide button
* Login state
* tsconfig
* Bug scanner camerascan
* Error dialog and filter subwarehouse !stg
* Upload photo error
* Update inventory case pallet code
* Wording login and popup hide
* Wording Assigned gate
* Editable false on edit pallet
* Menyesuaikan payload
* Menu scanner bottom
* Get pallet info

### Removed

* REMOVE CANCEL feature
* Remove `clg` (console.log)
* Remove log not necessary (PERF)

---

## [1.0.6] - 2026-04-01

### Added

* Confirmation dialog on inspection inbound

### Changed

* Handle error dialog on camera scan by error field
* Change style on button dialog 

### Fixed

* Menu gate forklift not showed up because status "PENDING" change into "COMPLETED"

---

## [1.0.5] - 2026-04-01

### Changed

* Hide Button on Scan (helper)
* Change Wording for Inbound, Outbound and Movement
* Hide Integrated tab
* Update status when Scanning
* Change api and fetch on NewMemoInspection
* Make Pending on top view

---

## [1.0.0] - 2026-01-19

### Added

* Initial release of the mobile application
* User authentication
* Basic navigation structure
* Dashboard screen