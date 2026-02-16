var menu = window.document.getElementById('menu');

window.onscroll = function  () {
	if (window.pageYOffset){
		menu.classList.remove('no-sticky');
		menu.classList.add('sticky')		
	}
	else {
		menu.classList.remove('sticky');
		menu.classList.add('no-sticky')	
	}
};

	window.setTimeout("waktu()", 1000);
 
	function waktu() {
		var waktu = new Date();
		setTimeout("waktu()", 1000);
		var jam = document.getElementById("jam");
		var menit = document.getElementById("menit");
		var detik = document.getElementById("detik");
		if (jam && menit && detik) {
			jam.innerHTML = waktu.getHours();
			menit.innerHTML = waktu.getMinutes();
			detik.innerHTML = waktu.getSeconds();
		}
	}
