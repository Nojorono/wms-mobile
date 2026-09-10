# Changelog

All notable changes to this project will be documented in this file.

The format is based on **Keep a Changelog** and this project adheres to **Semantic Versioning (SemVer)**.

---

## [Unreleased]

---

## [2.0.0] - 2026-09-10

### Added

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
* Menu split and merge dibuka di helper
* Subdist bisa make internal, vendor, & eksternal
* Tambah label subwarehouse di movelocation
* Add label subwarehouse on forklift
* Labeling di picking
* Filter rejecter
* Helper sortir
* Inspection Retur
* Helper menu
* Initial inbound retur
* Add completed filter
* Add % in text
* Add filter inspection
* Pallet is booking or not di create
* Add capacity on create update inventory
* Reject Inspection
* Tambahin tampilan week
* Scan di forklift
* Vendor bisa integrasi juga dan subdist tidak integrasi
* Changelog

### Changed

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
* Helper cannot open detail updateinventory
* Inbound ga mandatory upload foto
* Kalo belom completed gabisa add vehicle
* Penjagaan pallet memo_id gabisa tapi ga jadi
* Subdist === eksternal
* Update Pallet Rejected
* Hide retur
* Update name screen retur
* Harus sama week dan uom
* Kalo statusnya pending gabisa dipencet di approval
* Rename list in update inventory
* Update item yang statusnya OPEN
* Inspection hanya bisa update qty dan kunci plan by transaction_picking.quantity

### Fixed

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
* Loading Dialog
* Kuduus item uom disabled
* KUDUS wording dan button inspecntion
* Rejected pallet path
* Pak aji nemu code === code
* Handle deleted button features
* Handle double click
* Payload data fixing
* Movelocation pallet button disabled
* Add status_do
* Filter move location approved
* Handle cancel sj
* Tambahin kondisi agar button tidak keluar
* Disabled button tidak jadi
* Item dan week harus sama kalo mau pallet pick = sumber (PREELOAD)
* Handle 1 id uom week dan bin di updateInventoryCreate
* Cari kalo ada salah satu yang ready bisa dipake
* Handle double click on movement
* Pallet sumber kalo sama picking gaperlu check capacity
* Validate pallet yg memo_id is null
* Data yang di cancelled tidak boleh ada
* Add status unloading agar bisa di delete activitynya
* Item bisa keluar yg statusnya != open
* Delete button keluar saat integrasi ulang
* Logic button on inspection
* Message error by BE
* If !Ready and current_quantity != 0 === true

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